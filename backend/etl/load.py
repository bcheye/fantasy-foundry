import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

# Read DB config from .env
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"Connecting to database at {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

def load_csv_to_db(csv_path, schema, table_name):
    df = pd.read_csv(csv_path)
    df.to_sql(table_name, engine, if_exists="replace", index=False, schema=schema)
    print(f"✔ Loaded {len(df)} rows into {table_name}")

if __name__ == "__main__":
    load_csv_to_db("players.csv", "fpl","players")
    load_csv_to_db("teams.csv", "fpl", "teams")