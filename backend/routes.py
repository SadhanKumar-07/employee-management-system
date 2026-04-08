from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import List
from datetime import datetime
import time
import os
import shutil
from models import (
    User, Employee, Attendance, LeaveApplication, Payroll, DashboardStats,
    LoginRequest, LoginResponse, Project, ChatMessage,
    Interview, OnboardingTask, PerformanceRating, Schedule,
    SalaryRecord, BankAccountDetails, TaxDetails
)
from database import (
    user_collection, employee_collection, attendance_collection,
    leave_collection, payroll_collection, salary_collection,
    project_collection, chat_collection,
    interview_collection, onboarding_collection, performance_collection, schedule_collection,
    salary_record_collection, bank_account_collection, tax_detail_collection
)
from pydantic import BaseModel

router = APIRouter()

# ---- Auth ----
@router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    user = await user_collection.find_one({"username": req.username})
    if not user:
        user = await user_collection.find_one({"username": f"{req.username}@payrollpro.com"})
    if user:
        user['_id'] = str(user['_id'])
        return LoginResponse(
            token=f"mock-jwt-token-{user['user_id']}",
            user=user
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")

# ---- Employees ----
@router.get("/employees", response_model=List[Employee])
async def get_all_employees():
    employees = []
    async for emp in employee_collection.find():
        emp['_id'] = str(emp['_id'])
        sal = await salary_collection.find_one({"salary_structure_id": emp.get("salary_structure_id")})
        if sal:
            sal['_id'] = str(sal['_id'])
            emp['salary_structure'] = sal
        employees.append(Employee(**emp))
    return employees

@router.post("/employees", response_model=Employee)
async def create_employee(req: dict):
    emp_id = f"EMP{int(time.time()*100)}"
    req["employee_id"] = emp_id
    req["status"] = "Active"
    if "salary_structure_id" not in req:
        req["salary_structure_id"] = "SS001"
    if "avatar" not in req:
        req["avatar"] = None
    if "phone" not in req:
        req["phone"] = ""
    if "role" not in req or not req["role"]:
        req["role"] = "employee"
    await employee_collection.insert_one(req.copy())

    base_username = req.get("email", "").split("@")[0].lower()
    existing_user = await user_collection.find_one({"username": base_username})
    final_username = base_username if not existing_user else f"{base_username}{int(time.time() % 1000)}"
    user_record = {
        "user_id": f"U{int(time.time()*100)}",
        "username": final_username,
        "role": "employee",
        "employee_id": emp_id
    }
    await user_collection.insert_one(user_record)
    return Employee(**req)

@router.get("/employees/{id}", response_model=Employee)
async def get_employee(id: str):
    emp = await employee_collection.find_one({"employee_id": id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp['_id'] = str(emp['_id'])
    sal = await salary_collection.find_one({"salary_structure_id": emp.get("salary_structure_id")})
    if sal:
        sal['_id'] = str(sal['_id'])
        emp['salary_structure'] = sal
    return Employee(**emp)

@router.put("/employees/{id}", response_model=Employee)
async def update_employee(id: str, req: dict):
    req.pop("_id", None)
    req.pop("employee_id", None)
    await employee_collection.update_one({"employee_id": id}, {"$set": req})
    return await get_employee(id)

@router.delete("/employees/{id}")
async def delete_employee(id: str):
    emp = await employee_collection.find_one_and_delete({"employee_id": id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    await user_collection.delete_many({"employee_id": id})
    await attendance_collection.delete_many({"employee_id": id})
    await leave_collection.delete_many({"employee_id": id})
    await payroll_collection.delete_many({"employee_id": id})
    return {"status": "success", "message": "Employee deleted"}

# ---- Attendance ----
@router.get("/attendance", response_model=List[Attendance])
async def get_attendance():
    att = []
    async for a in attendance_collection.find():
        a['_id'] = str(a['_id'])
        att.append(Attendance(**a))
    return att

@router.get("/attendance/employee/{id}", response_model=List[Attendance])
async def get_employee_attendance(id: str):
    att = []
    async for a in attendance_collection.find({"employee_id": id}):
        a['_id'] = str(a['_id'])
        att.append(Attendance(**a))
    return att

class CheckInRequest(BaseModel):
    employee_id: str

@router.post("/attendance/check-in", response_model=Attendance)
async def check_in(req: CheckInRequest):
    now = datetime.now()
    att_id = f"ATT{int(time.time()*1000)}"
    emp = await employee_collection.find_one({"employee_id": req.employee_id})
    emp_name = emp['name'] if emp else None
    record = {
        "attendance_id": att_id,
        "employee_id": req.employee_id,
        "employee_name": emp_name,
        "date": now.strftime("%Y-%m-%d"),
        "check_in": now.strftime("%H:%M"),
        "check_out": None,
        "total_hours": None
    }
    await attendance_collection.insert_one(record.copy())
    return Attendance(**record)

class CheckOutRequest(BaseModel):
    attendance_id: str

@router.post("/attendance/check-out", response_model=Attendance)
async def check_out(req: CheckOutRequest):
    record = await attendance_collection.find_one({"attendance_id": req.attendance_id})
    if not record:
        raise HTTPException(status_code=404, detail="Not found")
    now = datetime.now()
    check_out_time = now.strftime("%H:%M")
    check_in_time = record.get("check_in")
    total_hours = None
    if check_in_time:
        try:
            in_h, in_m = map(int, check_in_time.split(':'))
            out_h, out_m = map(int, check_out_time.split(':'))
            total_hours = round(((out_h * 60 + out_m) - (in_h * 60 + in_m)) / 60, 2)
        except:
            pass
    await attendance_collection.update_one(
        {"attendance_id": req.attendance_id},
        {"$set": {"check_out": check_out_time, "total_hours": total_hours}}
    )
    updated = await attendance_collection.find_one({"attendance_id": req.attendance_id})
    updated['_id'] = str(updated['_id'])
    return Attendance(**updated)

# ---- Leave ----
@router.get("/leaves", response_model=List[LeaveApplication])
async def get_leaves():
    leaves = []
    async for l in leave_collection.find():
        l['_id'] = str(l['_id'])
        leaves.append(LeaveApplication(**l))
    return leaves

@router.get("/leaves/employee/{id}", response_model=List[LeaveApplication])
async def get_employee_leaves(id: str):
    leaves = []
    async for l in leave_collection.find({"employee_id": id}):
        l['_id'] = str(l['_id'])
        leaves.append(LeaveApplication(**l))
    return leaves

class LeaveRequest(BaseModel):
    employee_id: str
    leave_type: str
    start_date: str
    end_date: str
    reason: str

@router.post("/leaves", response_model=LeaveApplication)
async def apply_leave(req: LeaveRequest):
    leave_id = f"LV{int(time.time()*1000)}"
    emp = await employee_collection.find_one({"employee_id": req.employee_id})
    emp_name = emp['name'] if emp else None
    record = {
        "leave_id": leave_id,
        "employee_id": req.employee_id,
        "employee_name": emp_name,
        "leave_type": req.leave_type,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "reason": req.reason,
        "status": "Pending",
        "approved_by": None
    }
    await leave_collection.insert_one(record.copy())
    return LeaveApplication(**record)

@router.post("/leaves/{id}/approve", response_model=LeaveApplication)
async def approve_leave(id: str):
    await leave_collection.update_one({"leave_id": id}, {"$set": {"status": "Approved", "approved_by": "GM"}})
    record = await leave_collection.find_one({"leave_id": id})
    record['_id'] = str(record['_id'])
    return LeaveApplication(**record)

@router.post("/leaves/{id}/reject", response_model=LeaveApplication)
async def reject_leave(id: str):
    await leave_collection.update_one({"leave_id": id}, {"$set": {"status": "Rejected", "approved_by": "GM"}})
    record = await leave_collection.find_one({"leave_id": id})
    record['_id'] = str(record['_id'])
    return LeaveApplication(**record)

# ---- Payroll ----
@router.get("/payroll", response_model=List[Payroll])
async def get_payroll():
    payrolls = []
    async for p in payroll_collection.find():
        p['_id'] = str(p['_id'])
        payrolls.append(Payroll(**p))
    return payrolls

@router.get("/payroll/employee/{id}", response_model=List[Payroll])
async def get_employee_payroll(id: str):
    payrolls = []
    async for p in payroll_collection.find({"employee_id": id}):
        p['_id'] = str(p['_id'])
        payrolls.append(Payroll(**p))
    return payrolls

# ---- Dashboard ----
@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_stats():
    active = await employee_collection.count_documents({"status": "Active"})
    total = await employee_collection.count_documents({})
    pending = await leave_collection.count_documents({"status": "Pending"})
    total_payroll = 0.0
    async for p in payroll_collection.find():
        total_payroll += float(p.get("net_salary", 0))
    today = datetime.now().strftime("%Y-%m-%d")
    present = await attendance_collection.count_documents({"date": today})
    total_projects = await project_collection.count_documents({})
    active_projects = await project_collection.count_documents({"status": "Active"})
    return DashboardStats(
        totalEmployees=total,
        activeEmployees=active,
        pendingLeaves=pending,
        totalPayroll=total_payroll,
        presentToday=present,
        absentToday=active - present,
        totalProjects=total_projects,
        activeProjects=active_projects
    )

# ---- Projects and Chat ----
@router.post("/projects", response_model=Project)
async def create_project(req: dict):
    req['project_id'] = f"PRJ{int(time.time()*1000)}"
    req['status'] = "Active"
    if 'team_members' not in req:
        req['team_members'] = []
    await project_collection.insert_one(req.copy())
    return Project(**req)

@router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = []
    async for p in project_collection.find():
        p['_id'] = str(p['_id'])
        projects.append(Project(**p))
    return projects

@router.get("/projects/{id}", response_model=Project)
async def get_project(id: str):
    p = await project_collection.find_one({"project_id": id})
    if not p:
        raise HTTPException(status_code=404)
    p['_id'] = str(p['_id'])
    return Project(**p)

@router.put("/projects/{id}", response_model=Project)
async def update_project(id: str, req: dict):
    req.pop("_id", None)
    req.pop("project_id", None)
    await project_collection.update_one({"project_id": id}, {"$set": req})
    return await get_project(id)

class TeamUpdateRequest(BaseModel):
    team_members: List[str]

@router.put("/projects/{id}/team", response_model=Project)
async def update_project_team(id: str, req: TeamUpdateRequest):
    await project_collection.update_one({"project_id": id}, {"$set": {"team_members": req.team_members}})
    p = await project_collection.find_one({"project_id": id})
    p['_id'] = str(p['_id'])
    return Project(**p)

@router.post("/projects/{id}/chat/{channel}", response_model=ChatMessage)
async def send_chat_message(
    id: str,
    channel: str,
    sender_id: str = Form(...),
    sender_name: str = Form(...),
    content: str = Form(""),
    file: UploadFile = File(None)
):
    file_url = None
    file_name = None
    if file:
        file_name = file.filename
        upload_path = f"uploads/{int(time.time())}_{file_name}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_url = f"/{upload_path}"
    msg_id = f"MSG{int(time.time()*1000)}"
    now = datetime.now().isoformat()
    msg = {
        "message_id": msg_id,
        "project_id": id,
        "channel": channel,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "content": content,
        "file_url": file_url,
        "file_name": file_name,
        "timestamp": now
    }
    await chat_collection.insert_one(msg.copy())
    return ChatMessage(**msg)

@router.get("/projects/{id}/chat/{channel}", response_model=List[ChatMessage])
async def get_chat_messages(id: str, channel: str):
    msgs = []
    async for m in chat_collection.find({"project_id": id, "channel": channel}):
        m['_id'] = str(m['_id'])
        msgs.append(ChatMessage(**m))
    return msgs

# ---- Interviews (HR Manager) ----
@router.get("/interviews", response_model=List[Interview])
async def get_interviews():
    interviews = []
    async for i in interview_collection.find():
        i['_id'] = str(i['_id'])
        interviews.append(Interview(**i))
    return interviews

class InterviewRequest(BaseModel):
    candidate_name: str
    position: str
    scheduled_date: str
    scheduled_time: str
    interviewer_id: str
    notes: str = ""

@router.post("/interviews", response_model=Interview)
async def create_interview(req: InterviewRequest):
    interview_id = f"INT{int(time.time()*1000)}"
    emp = await employee_collection.find_one({"employee_id": req.interviewer_id})
    interviewer_name = emp['name'] if emp else req.interviewer_id
    record = {
        "interview_id": interview_id,
        "candidate_name": req.candidate_name,
        "position": req.position,
        "scheduled_date": req.scheduled_date,
        "scheduled_time": req.scheduled_time,
        "interviewer_id": req.interviewer_id,
        "interviewer_name": interviewer_name,
        "status": "Scheduled",
        "notes": req.notes
    }
    await interview_collection.insert_one(record.copy())
    return Interview(**record)

class InterviewUpdate(BaseModel):
    status: str
    notes: str = ""

@router.put("/interviews/{id}", response_model=Interview)
async def update_interview(id: str, req: InterviewUpdate):
    await interview_collection.update_one(
        {"interview_id": id},
        {"$set": {"status": req.status, "notes": req.notes}}
    )
    record = await interview_collection.find_one({"interview_id": id})
    if not record:
        raise HTTPException(status_code=404, detail="Interview not found")
    record['_id'] = str(record['_id'])
    return Interview(**record)

# ---- Onboarding (HR Manager) ----
@router.get("/onboarding", response_model=List[OnboardingTask])
async def get_all_onboarding():
    tasks = []
    async for t in onboarding_collection.find():
        t['_id'] = str(t['_id'])
        tasks.append(OnboardingTask(**t))
    return tasks

@router.get("/onboarding/{employee_id}", response_model=List[OnboardingTask])
async def get_employee_onboarding(employee_id: str):
    tasks = []
    async for t in onboarding_collection.find({"employee_id": employee_id}):
        t['_id'] = str(t['_id'])
        tasks.append(OnboardingTask(**t))
    return tasks

class OnboardingTaskRequest(BaseModel):
    employee_id: str
    task_name: str
    due_date: str = ""

@router.post("/onboarding", response_model=OnboardingTask)
async def create_onboarding_task(req: OnboardingTaskRequest):
    task_id = f"OBT{int(time.time()*1000)}"
    emp = await employee_collection.find_one({"employee_id": req.employee_id})
    emp_name = emp['name'] if emp else None
    record = {
        "task_id": task_id,
        "employee_id": req.employee_id,
        "employee_name": emp_name,
        "task_name": req.task_name,
        "completed": False,
        "due_date": req.due_date
    }
    await onboarding_collection.insert_one(record.copy())
    return OnboardingTask(**record)

@router.put("/onboarding/task/{task_id}", response_model=OnboardingTask)
async def update_onboarding_task(task_id: str, req: dict):
    await onboarding_collection.update_one({"task_id": task_id}, {"$set": req})
    record = await onboarding_collection.find_one({"task_id": task_id})
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    record['_id'] = str(record['_id'])
    return OnboardingTask(**record)

# ---- Performance Ratings (PM / GM) ----
@router.get("/performance", response_model=List[PerformanceRating])
async def get_all_ratings():
    ratings = []
    async for r in performance_collection.find():
        r['_id'] = str(r['_id'])
        ratings.append(PerformanceRating(**r))
    return ratings

@router.get("/performance/employee/{employee_id}", response_model=List[PerformanceRating])
async def get_employee_ratings(employee_id: str):
    ratings = []
    async for r in performance_collection.find({"employee_id": employee_id}):
        r['_id'] = str(r['_id'])
        ratings.append(PerformanceRating(**r))
    return ratings

@router.get("/performance/project/{project_id}", response_model=List[PerformanceRating])
async def get_project_ratings(project_id: str):
    ratings = []
    async for r in performance_collection.find({"project_id": project_id}):
        r['_id'] = str(r['_id'])
        ratings.append(PerformanceRating(**r))
    return ratings

class RatingRequest(BaseModel):
    employee_id: str
    project_id: str
    rated_by: str
    rating: float
    comments: str = ""

@router.post("/performance", response_model=PerformanceRating)
async def create_rating(req: RatingRequest):
    rating_id = f"RAT{int(time.time()*1000)}"
    emp = await employee_collection.find_one({"employee_id": req.employee_id})
    emp_name = emp['name'] if emp else None
    pm = await employee_collection.find_one({"employee_id": req.rated_by})
    pm_name = pm['name'] if pm else None
    proj = await project_collection.find_one({"project_id": req.project_id})
    proj_name = proj['name'] if proj else None
    record = {
        "rating_id": rating_id,
        "employee_id": req.employee_id,
        "employee_name": emp_name,
        "project_id": req.project_id,
        "project_name": proj_name,
        "rated_by": req.rated_by,
        "rated_by_name": pm_name,
        "rating": req.rating,
        "comments": req.comments,
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    await performance_collection.insert_one(record.copy())
    return PerformanceRating(**record)

# ---- Schedules (PM creates, employees view) ----
@router.get("/schedules", response_model=List[Schedule])
async def get_all_schedules():
    schedules = []
    async for s in schedule_collection.find():
        s['_id'] = str(s['_id'])
        schedules.append(Schedule(**s))
    return schedules

@router.get("/schedules/project/{project_id}", response_model=List[Schedule])
async def get_project_schedules(project_id: str):
    schedules = []
    async for s in schedule_collection.find({"project_id": project_id}):
        s['_id'] = str(s['_id'])
        schedules.append(Schedule(**s))
    return schedules

@router.get("/schedules/employee/{employee_id}", response_model=List[Schedule])
async def get_employee_schedules(employee_id: str):
    """Get schedules for projects the employee is a member of."""
    emp_projects = []
    async for p in project_collection.find({"team_members": employee_id}):
        emp_projects.append(p['project_id'])
    schedules = []
    async for s in schedule_collection.find({"project_id": {"$in": emp_projects}}):
        s['_id'] = str(s['_id'])
        schedules.append(Schedule(**s))
    return schedules

class ScheduleRequest(BaseModel):
    project_id: str
    title: str
    schedule_type: str
    date: str
    time: str = ""
    description: str = ""
    created_by: str = ""

@router.post("/schedules", response_model=Schedule)
async def create_schedule(req: ScheduleRequest):
    schedule_id = f"SCH{int(time.time()*1000)}"
    proj = await project_collection.find_one({"project_id": req.project_id})
    proj_name = proj['name'] if proj else None
    record = {
        "schedule_id": schedule_id,
        "project_id": req.project_id,
        "project_name": proj_name,
        "title": req.title,
        "schedule_type": req.schedule_type,
        "date": req.date,
        "time": req.time,
        "description": req.description,
        "created_by": req.created_by
    }
    await schedule_collection.insert_one(record.copy())
    return Schedule(**record)

@router.delete("/schedules/{id}")
async def delete_schedule(id: str):
    result = await schedule_collection.find_one_and_delete({"schedule_id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"status": "success"}

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
