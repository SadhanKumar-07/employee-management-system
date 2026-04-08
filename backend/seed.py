import asyncio
from database import user_collection, employee_collection, salary_collection, payroll_collection
import time

async def seed():
    # Insert fixed salary structure
    if await salary_collection.count_documents({}) == 0:
        await salary_collection.insert_one({
            "salary_structure_id": "SS001",
            "basic": 50000,
            "hra": 20000,
            "allowances": 10000,
            "gross_salary": 80000
        })

    # Clear existing users & employees for clean slate
    await user_collection.delete_many({})
    await employee_collection.delete_many({})

    # 4 fixed role users
    fixed_employees = [
        {"emp": "EMP001", "name": "Sarah Mitchell", "dept": "HR", "desig": "HR Manager", "user": "hr_manager", "role": "hr_manager"},
        {"emp": "EMP002", "name": "Robert Chen", "dept": "Management", "desig": "General Manager", "user": "gm_user", "role": "gm"},
        {"emp": "EMP003", "name": "David Kumar", "dept": "Engineering", "desig": "Project Manager", "user": "pm_user", "role": "project_manager"},
        {"emp": "EMP004", "name": "Emily Johnson", "dept": "Engineering", "desig": "Software Engineer", "user": "emp_user", "role": "employee"},
    ]

    for data in fixed_employees:
        email = f"{data['user']}@payrollpro.com"
        await user_collection.insert_one({
            "user_id": f"U_{data['emp']}",
            "username": data['user'],
            "role": data['role'],
            "employee_id": data['emp']
        })
        await employee_collection.insert_one({
            "employee_id": data['emp'],
            "name": data['name'],
            "email": email,
            "phone": "+1234567890",
            "employee_type": "Permanent",
            "department": data['dept'],
            "designation": data['desig'],
            "joining_date": "2023-01-01",
            "salary_structure_id": "SS001",
            "status": "Active",
            "role": data['role']
        })

    print("Fixed 4-role users seeded!")

    # Seed some Project Managers for projects
    pm_staff = [
        ("Amina Yusuf", "Project Manager", "Engineering", "amina.yusuf"),
        ("Suresh Raina", "Project Manager", "Engineering", "suresh.raina"),
        ("Elena Petrova", "Project Manager", "Engineering", "elena.petrova"),
        ("Kenji Tanaka", "Project Manager", "Engineering", "kenji.tanaka"),
        ("Chloe Dubois", "Project Manager", "Engineering", "chloe.dubois"),
    ]

    pm_ids = []
    for name, role_name, dept, user_name in pm_staff:
        emp_id = f"PM_{user_name.replace('.', '_')}"
        pm_ids.append(emp_id)
        email = f"{user_name}@payrollpro.com"
        await user_collection.insert_one({
            "user_id": f"U_{emp_id}",
            "username": user_name,
            "role": "project_manager",
            "employee_id": emp_id
        })
        await employee_collection.insert_one({
            "employee_id": emp_id,
            "name": name,
            "email": email,
            "phone": "+1234567890",
            "employee_type": "Permanent",
            "department": dept,
            "designation": role_name,
            "joining_date": "2023-01-01",
            "salary_structure_id": "SS001",
            "status": "Active",
            "role": "project_manager"
        })

    # Additional employees for realistic data
    extra_employees = [
        ("Arjun Mehta", "Back-end Developer", "Engineering"),
        ("Priya Sharma", "Back-end Developer", "Engineering"),
        ("Lucas Bennett", "Back-end Developer", "Engineering"),
        ("Ananya Rao", "Front-end Developer", "Engineering"),
        ("James Carter", "Front-end Developer", "Engineering"),
        ("Fatima Al-Rashid", "Front-end Developer", "Engineering"),
    ]

    emp_counter = 100
    all_emp_ids = ["EMP004"] # Including the fixed employee
    for name, role_name, dept in extra_employees:
        emp_id = f"EMP{emp_counter}"
        all_emp_ids.append(emp_id)
        base_username = name.lower().replace(' ', '.')
        email = f"{base_username}@payrollpro.com"
        await user_collection.insert_one({
            "user_id": f"U_{emp_id}",
            "username": base_username,
            "role": "employee",
            "employee_id": emp_id
        })
        await employee_collection.insert_one({
            "employee_id": emp_id,
            "name": name,
            "email": email,
            "phone": f"+12345{emp_counter}",
            "employee_type": "Permanent",
            "department": dept,
            "designation": role_name,
            "joining_date": "2023-05-01",
            "salary_structure_id": "SS001",
            "status": "Active",
            "role": "employee"
        })
        emp_counter += 1

    # Seed 5 Projects with different PMs
    from database import project_collection
    await project_collection.delete_many({})
    projects_data = [
        ("ERP Core Redesign", "Redesigning the core ERP modules", pm_ids[0]),
        ("Mobile App Development", "Creating a mobile companion app", pm_ids[1]),
        ("Cloud Infrastructure Migration", "Moving servers to AWS", pm_ids[2]),
        ("AI Analytics Integration", "Integrating ML models for performance prediction", pm_ids[3]),
        ("Security Audit 2026", "Comprehensive security review", pm_ids[4]),
    ]

    for i, (name, desc, pm_id) in enumerate(projects_data):
        import random
        team = random.sample(all_emp_ids, k=min(3, len(all_emp_ids)))
        await project_collection.insert_one({
            "project_id": f"PRJ00{i+1}",
            "name": name,
            "description": desc,
            "general_manager_id": "EMP002",
            "project_manager_id": pm_id,
            "status": "Active",
            "team_members": team,
            "deadline": "2026-12-31"
        })

    # Seed some payroll data
    if await payroll_collection.count_documents({}) == 0:
        emp_ids = ["EMP001", "EMP002", "EMP003", "EMP004"]
        for emp_id in emp_ids:
            emp = await employee_collection.find_one({"employee_id": emp_id})
            await payroll_collection.insert_one({
                "payroll_id": f"PAY_{emp_id}_2025_03",
                "employee_id": emp_id,
                "employee_name": emp['name'] if emp else emp_id,
                "month": "March 2025",
                "gross_salary": 80000,
                "deductions": 12000,
                "net_salary": 68000,
                "payment_status": "Credited",
                "transaction_id": f"TXN{emp_id}",
                "payment_date": "2025-03-31",
                "pay_period_start": "2025-03-01",
                "pay_period_end": "2025-03-31",
                "generated_at": "2025-03-28",
                "basic": 50000,
                "hra": 20000,
                "allowances": 10000
            })

    print("All data seeded successfully!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed())
