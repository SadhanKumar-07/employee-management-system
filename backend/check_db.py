import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["payroll_db"]
    
    print("--- Projects ---")
    async for p in db["projects"].find():
        print(f"Name: {p.get('name')}, PM ID: {p.get('project_manager_id')}")
        
    print("\n--- Users ---")
    async for u in db["users"].find():
        print(f"Username: {u.get('username')}, Role: {u.get('role')}, Emp ID: {u.get('employee_id')}")

if __name__ == "__main__":
    asyncio.run(check())
