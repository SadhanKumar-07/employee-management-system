import asyncio
from database import database
from seed import seed

async def reset_and_seed():
    await database.drop_collection("users")
    await database.drop_collection("employees")
    await database.drop_collection("salary_structures")
    await database.drop_collection("attendance")
    await database.drop_collection("leaves")
    await database.drop_collection("payroll")
    print("Database collections dropped.")
    await seed()
    print("Seeded new collections!")

asyncio.run(reset_and_seed())
