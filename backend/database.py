import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.payroll_db

# Collections
user_collection = database.get_collection("users")
employee_collection = database.get_collection("employees")
salary_collection = database.get_collection("salary_structures")
attendance_collection = database.get_collection("attendance")
leave_collection = database.get_collection("leaves")
payroll_collection = database.get_collection("payroll")
project_collection = database.get_collection("projects")
chat_collection = database.get_collection("chats")

# New collections
interview_collection = database.get_collection("interviews")
onboarding_collection = database.get_collection("onboarding_tasks")
performance_collection = database.get_collection("performance_ratings")
schedule_collection = database.get_collection("schedules")
salary_record_collection = database.get_collection("salary_records")
bank_account_collection = database.get_collection("bank_accounts")
tax_detail_collection = database.get_collection("tax_details")
