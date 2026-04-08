
# ---- Detailed Attendance Report (GM) ----
@router.get("/attendance/report/detail")
async def get_attendance_detail_report():
    today = datetime.now().strftime("%Y-%m-%d")
    current_month = datetime.now().strftime("%Y-%m")
    result = []
    async for emp in employee_collection.find({"status": "Active"}):
        emp_id = emp["employee_id"]
        today_rec = await attendance_collection.find_one({"employee_id": emp_id, "date": today})
        on_leave = await leave_collection.find_one({
            "employee_id": emp_id, "status": "Approved",
            "start_date": {"$lte": today}, "end_date": {"$gte": today}
        })
        month_count = await attendance_collection.count_documents({
            "employee_id": emp_id,
            "date": {"$regex": f"^{current_month}"}
        })
        result.append({
            "employee_id": emp_id,
            "name": emp.get("name"),
            "department": emp.get("department"),
            "designation": emp.get("designation"),
            "present_today": today_rec is not None,
            "checked_in": today_rec.get("check_in") if today_rec else None,
            "checked_out": today_rec.get("check_out") if today_rec else None,
            "available_now": today_rec is not None and today_rec.get("check_out") is None,
            "on_leave_today": on_leave is not None,
            "leave_type": on_leave.get("leave_type") if on_leave else None,
            "present_days_this_month": month_count
        })
    return result

# ---- Bank Accounts ----
@router.get("/bank-accounts/{employee_id}")
async def get_bank_account(employee_id: str):
    rec = await bank_account_collection.find_one({"employee_id": employee_id})
    if not rec:
        return {}
    rec['_id'] = str(rec['_id'])
    return rec

class BankAccountRequest(BaseModel):
    employee_id: str
    account_number: str
    bank_name: str
    ifsc_code: str
    account_holder_name: str

@router.post("/bank-accounts")
async def save_bank_account(req: BankAccountRequest):
    await bank_account_collection.update_one(
        {"employee_id": req.employee_id}, {"$set": req.dict()}, upsert=True
    )
    result = await bank_account_collection.find_one({"employee_id": req.employee_id})
    result['_id'] = str(result['_id'])
    return result

# ---- Tax Details ----
@router.get("/tax-details/{employee_id}")
async def get_tax_details(employee_id: str):
    rec = await tax_detail_collection.find_one({"employee_id": employee_id})
    if not rec:
        return {}
    rec['_id'] = str(rec['_id'])
    return rec

class TaxDetailRequest(BaseModel):
    employee_id: str
    pan_number: str
    tax_regime: str
    annual_tax: float
    monthly_tax: float
    pf_monthly: float

@router.post("/tax-details")
async def save_tax_details(req: TaxDetailRequest):
    await tax_detail_collection.update_one(
        {"employee_id": req.employee_id}, {"$set": req.dict()}, upsert=True
    )
    result = await tax_detail_collection.find_one({"employee_id": req.employee_id})
    result['_id'] = str(result['_id'])
    return result

# ---- Salary Records ----
@router.get("/salary-records", response_model=List[SalaryRecord])
async def get_all_salary_records():
    records = []
    async for r in salary_record_collection.find():
        r['_id'] = str(r['_id'])
        records.append(SalaryRecord(**r))
    return records

@router.get("/salary-records/employee/{employee_id}", response_model=List[SalaryRecord])
async def get_employee_salary_records(employee_id: str):
    records = []
    async for r in salary_record_collection.find({"employee_id": employee_id}):
        r['_id'] = str(r['_id'])
        records.append(SalaryRecord(**r))
    return records

class GenerateSalaryRequest(BaseModel):
    employee_id: str
    month: str
    pay_date: str
    working_days: int = 26

@router.post("/salary-records/generate", response_model=SalaryRecord)
async def generate_salary(req: GenerateSalaryRequest):
    emp = await employee_collection.find_one({"employee_id": req.employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    sal = await salary_collection.find_one({"salary_structure_id": emp.get("salary_structure_id", "SS001")})
    if not sal:
        raise HTTPException(status_code=404, detail="Salary structure not found")

    basic = float(sal.get("basic", 0))
    hra = float(sal.get("hra", 0))
    allowances = float(sal.get("allowances", 0))
    gross = basic + hra + allowances

    tax_doc = await tax_detail_collection.find_one({"employee_id": req.employee_id})
    monthly_tax = float(tax_doc.get("monthly_tax", 0)) if tax_doc else 0.0
    pf_monthly = float(tax_doc.get("pf_monthly", 1800)) if tax_doc else 1800.0

    current_month_prefix = req.pay_date[:7]
    unpaid_days = 0
    async for lv in leave_collection.find({"employee_id": req.employee_id, "status": "Approved"}):
        s, e = lv.get("start_date", ""), lv.get("end_date", "")
        if s[:7] == current_month_prefix or e[:7] == current_month_prefix:
            try:
                from datetime import date as ddate
                d1, d2 = ddate.fromisoformat(s), ddate.fromisoformat(e)
                unpaid_days += (d2 - d1).days + 1
            except Exception:
                pass

    per_day = gross / req.working_days if req.working_days > 0 else 0
    leave_deduction = round(per_day * unpaid_days, 2)
    total_deductions = round(monthly_tax + pf_monthly + leave_deduction, 2)
    net_salary = round(gross - total_deductions, 2)

    bank_doc = await bank_account_collection.find_one({"employee_id": req.employee_id})

    record = {
        "salary_record_id": f"SAL{int(time.time()*1000)}",
        "employee_id": req.employee_id,
        "employee_name": emp.get("name"),
        "basic": basic, "hra": hra, "allowances": allowances, "gross_salary": gross,
        "tax_deduction": monthly_tax, "pf_deduction": pf_monthly,
        "leave_deduction": leave_deduction, "total_deductions": total_deductions,
        "net_salary": net_salary,
        "month": req.month, "pay_date": req.pay_date,
        "payment_status": "Pending",
        "unpaid_leave_days": unpaid_days, "working_days": req.working_days,
        "per_day_salary": round(per_day, 2),
        "bank_account": {
            "account_number": bank_doc.get("account_number"),
            "bank_name": bank_doc.get("bank_name"),
            "ifsc_code": bank_doc.get("ifsc_code"),
            "account_holder_name": bank_doc.get("account_holder_name"),
        } if bank_doc else None,
        "tax_details": {
            "pan_number": tax_doc.get("pan_number"),
            "tax_regime": tax_doc.get("tax_regime"),
            "annual_tax": float(tax_doc.get("annual_tax", 0)),
            "monthly_tax": monthly_tax,
            "pf_monthly": pf_monthly,
        } if tax_doc else None
    }
    await salary_record_collection.insert_one(record.copy())
    return SalaryRecord(**record)

@router.post("/salary-records/{record_id}/credit", response_model=SalaryRecord)
async def credit_salary(record_id: str):
    rec = await salary_record_collection.find_one({"salary_record_id": record_id})
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    await salary_record_collection.update_one(
        {"salary_record_id": record_id}, {"$set": {"payment_status": "Credited"}}
    )
    updated = await salary_record_collection.find_one({"salary_record_id": record_id})
    updated['_id'] = str(updated['_id'])
    return SalaryRecord(**updated)
