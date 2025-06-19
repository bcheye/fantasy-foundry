import logging
import time
from typing import Optional, List, Dict, Any, Generator

from sqlalchemy import create_engine, text, insert
from sqlalchemy.dialects import postgresql
from sqlalchemy.engine import Engine, Result
from sqlalchemy.orm import sessionmaker, Session as OrmSession
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager


class SQLAlchemyConnector:
    """Manages PostgreSQL connections using SQLAlchemy (Core + ORM)."""

    def __init__(
        self,
        user: str,
        password: str,
        host: str,
        database: str,
        port: int = 5432,
        pool_size: int = 5,
        max_overflow: int = 10,
        debug: bool = False,
    ):
        self.url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
        logging.basicConfig(
            level=logging.DEBUG if debug else logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
        )

        self.engine: Engine = create_engine(
            self.url,
            pool_size=pool_size,
            max_overflow=max_overflow,
            echo=debug,
            future=True,
        )

        self.SessionLocal = sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
            future=True,
        )

        logging.info(f"Engine created for {self.url}")

    def connect(self, retries: int = 3, delay: int = 2) -> bool:
        for attempt in range(1, retries + 1):
            try:
                with self.engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                logging.info("Database connectivity verified.")
                return True
            except Exception as e:
                logging.warning(f"Attempt {attempt} - Connection failed: {e}")
                time.sleep(delay)
        logging.error("All connection attempts failed.")
        return False

    def execute(
        self,
        query: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Optional[List[Dict[str, Any]]]:
        start = time.time()
        try:
            with self.engine.connect() as conn:
                result: Result = conn.execute(text(query), params or {})
                rows = (
                    [dict(row) for row in result.mappings().all()]
                    if result.returns_rows
                    else None
                )
            logging.info(f"Executed in {time.time() - start:.3f}s: {query}")
            return rows
        except SQLAlchemyError as e:
            logging.error(f"Execution error: {e}")
            return None

    def fetchall(
        self,
        query: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        start = time.time()
        try:
            with self.engine.connect() as conn:
                result: Result = conn.execute(text(query), params or {})
                rows = [dict(row) for row in result.mappings().all()]
            logging.info(
                f"Fetched {len(rows)} rows in {time.time() - start:.3f}s: {query}"
            )
            return rows
        except SQLAlchemyError as e:
            logging.error(f"Fetch error: {e}")
            return []

    def execute_write(
        self,
        query: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> bool:
        try:
            with self.engine.begin() as conn:
                conn.execute(text(query), params or {})
            logging.info(f"Write executed: {query}")
            return True
        except SQLAlchemyError as e:
            logging.error(f"Write error: {e}")
            return False

    def executemany(
        self,
        query: str,
        params_list: List[Dict[str, Any]],
    ) -> bool:
        try:
            with self.engine.begin() as conn:
                conn.execute(text(query), params_list)
            logging.info(f"Batch write executed for {len(params_list)} sets")
            return True
        except SQLAlchemyError as e:
            logging.error(f"Batch write error: {e}")
            return False

    def insert_batch(self, table, data: List[Dict[str, Any]]) -> bool:
        """Insert rows in batch (no conflict resolution)."""
        if not data:
            return True
        try:
            with self.engine.begin() as conn:
                conn.execute(insert(table), data)
            logging.info(f"Batch insert into {table.name} succeeded.")
            return True
        except Exception as e:
            logging.error(f"Batch insert failed for {table.name}: {e}")
            return False

    def batch_upsert_on_conflict(
        self, table, data: List[Dict[str, Any]], conflict_target: List[str]
    ) -> bool:
        """Upsert rows based on PostgreSQL's ON CONFLICT DO UPDATE."""
        if not data:
            return True

        insert_stmt = postgresql.insert(table).values(data)

        update_cols = {
            c.name: getattr(insert_stmt.excluded, c.name)
            for c in table.columns
            if c.name not in conflict_target
        }

        do_update_stmt = insert_stmt.on_conflict_do_update(
            index_elements=conflict_target,
            set_=update_cols,
        )
        try:
            with self.engine.begin() as conn:
                conn.execute(do_update_stmt)
            logging.info(f"Batch upsert on {table.name} succeeded.")
            return True
        except Exception as e:
            logging.error(f"Batch upsert failed for {table.name}: {e}")
            return False

    def get_session(self) -> OrmSession:
        return self.SessionLocal()

    @contextmanager
    def session_scope(self) -> Generator[OrmSession, None, None]:
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logging.error(f"Session rollback due to error: {e}")
            raise
        finally:
            session.close()

    def dispose(self):
        self.engine.dispose()
        logging.info("Engine disposed.")

    def __enter__(self):
        if not self.connect():
            raise RuntimeError("Unable to connect to the database.")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.dispose()
