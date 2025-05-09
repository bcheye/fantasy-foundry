import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.dialects.postgresql import insert
from dotenv import load_dotenv

load_dotenv()

class PostgresConnector:
    def __init__(self, reflect: bool = True):
        self.engine = create_engine(self._build_url())
        self.metadata = MetaData(schema="fpl")
        if reflect:
            self.metadata.reflect(bind=self.engine)

    def _build_url(self):
        return f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@" \
               f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME')}"

    def get_engine(self):
        return self.engine

    def get_metadata(self):
        return self.metadata

    def get_table(self, table_name):
        return self.metadata.tables[f"fpl.{table_name}"]

    def insert_rows(self, table_name, rows, overwrite=False, conflict_keys=None):
        table = self.get_table(table_name)
        with self.engine.begin() as conn:
            if overwrite:
                conn.execute(table.delete())
            if conflict_keys:
                stmt = insert(table).values(rows).on_conflict_do_nothing(index_elements=conflict_keys)
                conn.execute(stmt)
            else:
                conn.execute(insert(table), rows)