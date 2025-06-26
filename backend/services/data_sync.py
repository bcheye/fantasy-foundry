import requests
import logging
import time
from datetime import datetime
from sqlalchemy import select, and_
from typing import Optional, List, Set, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from db.connector import SQLAlchemyConnector
from db.schema import (
    players,
    teams,
    gameweeks,
    positions,
    mini_leagues,
    overview,
    gameweek_history,
)

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)


class FPLDataSync:
    BASE_URL = "https://fantasy.premierleague.com/api"
    REQUEST_TIMEOUT = 10
    MAX_WORKERS = 20

    def __init__(self, db: SQLAlchemyConnector):
        self.db = db
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "FPLDataSync/1.0", "Accept": "application/json"}
        )

    def _safe_get(self, url: str, max_retries: int = 3) -> Optional[Dict[str, Any]]:
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=self.REQUEST_TIMEOUT)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.warning(f"[Attempt {attempt+1}] Failed to fetch {url}: {e}")
                time.sleep(0.5 * (attempt + 1))
        return None

    def _fetch_league_page(self, league_id: int, page: int) -> List[int]:
        data = self._safe_get(
            f"{self.BASE_URL}/leagues-classic/{league_id}/standings/?page={page}"
        )
        if data and "standings" in data and "results" in data["standings"]:
            return [entry["entry"] for entry in data["standings"]["results"]]
        return []

    def _get_league_entries(
        self, league_id: int, entry_id: int, pages: int = 2
    ) -> Set[int]:
        entries = set()
        with ThreadPoolExecutor(max_workers=pages) as executor:
            futures = {
                executor.submit(self._fetch_league_page, league_id, page): page
                for page in range(1, pages + 1)
            }
            for future in as_completed(futures):
                try:
                    entries.update(future.result())
                except Exception as e:
                    logger.warning(
                        f"Page {futures[future]} failed for league {league_id}: {e}"
                    )
        if entry_id not in entries:
            entries.add(entry_id)
        return entries

    def _process_entry_data(
        self, entry_id: int, entry_data: Dict[str, Any], history_data: Dict[str, Any]
    ) -> bool:
        try:
            overview_data = [
                {
                    "entry_id": entry_id,
                    "overall_points": entry_data.get("summary_overall_points"),
                    "overall_rank": entry_data.get("summary_overall_rank"),
                    "gameweek_points": entry_data.get("summary_event_points"),
                    "current_gameweek": entry_data.get("current_event"),
                    "team_value": entry_data.get("last_deadline_value"),
                }
            ]
            gameweek_history_data = [
                {
                    "entry_id": entry_id,
                    "gameweek": gw["event"],
                    "points": gw["points"],
                    "total_points": gw["total_points"],
                    "overall_rank": gw["overall_rank"],
                    "team_value": gw["value"],
                    "cost": gw["event_transfers_cost"],
                    "points_on_bench": gw["points_on_bench"],
                }
                for gw in history_data.get("current", [])
            ]

            self.db.batch_upsert_on_conflict(
                overview, overview_data, ["entry_id", "current_gameweek"]
            )
            self.db.batch_upsert_on_conflict(
                gameweek_history, gameweek_history_data, ["entry_id", "gameweek"]
            )
            return True
        except Exception as e:
            logger.error(f"Upsert failed for entry {entry_id}: {e}")
            return False

    def _sync_single_entry_history(self, entry_id: int) -> bool:
        try:
            with ThreadPoolExecutor(max_workers=2) as executor:
                entry_future = executor.submit(
                    self._safe_get, f"{self.BASE_URL}/entry/{entry_id}/"
                )
                history_future = executor.submit(
                    self._safe_get, f"{self.BASE_URL}/entry/{entry_id}/history/"
                )
                entry_data = entry_future.result()
                history_data = history_future.result()
            if not entry_data or not history_data:
                return False
            return self._process_entry_data(entry_id, entry_data, history_data)
        except Exception as e:
            logger.warning(f"Sync failed for entry {entry_id}: {e}")
            return False

    def _process_single_league(
        self, league_id: int, league_name: str, main_entry_id: int, pages: int = 2
    ) -> bool:
        logger.info(f"⏳ Processing league: {league_name} ({league_id})")
        entry_ids = self._get_league_entries(league_id, main_entry_id, pages)
        success_count = 0
        with ThreadPoolExecutor(max_workers=self.MAX_WORKERS) as executor:
            futures = {
                executor.submit(self._sync_single_entry_history, eid): eid
                for eid in entry_ids
            }
            for future in as_completed(futures):
                eid = futures[future]
                try:
                    if future.result():
                        success_count += 1
                    else:
                        logger.warning(f"❌ Entry {eid} failed in league {league_name}")
                except Exception as e:
                    logger.error(f"Error for entry {eid} in league {league_name}: {e}")
        logger.info(
            f"✅ {success_count}/{len(entry_ids)} synced for league {league_name}"
        )
        return success_count == len(entry_ids)

    def sync_user_data(self, entry_id: int) -> bool:
        try:
            with ThreadPoolExecutor(max_workers=2) as executor:
                entry_future = executor.submit(
                    self._safe_get, f"{self.BASE_URL}/entry/{entry_id}/"
                )
                history_future = executor.submit(
                    self._safe_get, f"{self.BASE_URL}/entry/{entry_id}/history/"
                )
                entry_data = entry_future.result()
                history_data = history_future.result()
            if not entry_data or not history_data:
                return False
            return self._process_entry_data(entry_id, entry_data, history_data)
        except Exception as e:
            logger.exception(f"Sync user failed for {entry_id}")
            return False

    def sync_bootstrap_data(self) -> bool:
        try:
            data = self._safe_get(f"{self.BASE_URL}/bootstrap-static/")
            if not data:
                return False
            tables = [
                (
                    teams,
                    [
                        {
                            "team_id": t["id"],
                            "name": t["name"],
                            "short_name": t["short_name"],
                            "strength_overall_home": t["strength_overall_home"],
                            "strength_overall_away": t["strength_overall_away"],
                        }
                        for t in data["teams"]
                    ],
                    ["team_id"],
                ),
                (
                    positions,
                    [
                        {
                            "position_type_id": p["id"],
                            "singular_name": p["singular_name"],
                            "plural_name": p["plural_name_short"],
                        }
                        for p in data["element_types"]
                    ],
                    ["position_type_id"],
                ),
                (
                    players,
                    [
                        {
                            "player_id": p["id"],
                            "first_name": p["first_name"],
                            "second_name": p["second_name"],
                            "team": p["team"],
                            "cost": p["now_cost"] / 10,
                            "total_points": p["total_points"],
                            "selected_by_percent": p["selected_by_percent"],
                            "minutes": p["minutes"],
                            "goals_scored": p["goals_scored"],
                            "assists": p["assists"],
                            "clean_sheets": p["clean_sheets"],
                            "yellow_cards": p["yellow_cards"],
                            "red_cards": p["red_cards"],
                        }
                        for p in data["elements"]
                    ],
                    ["player_id"],
                ),
                (
                    gameweeks,
                    [
                        {
                            "gameweek_id": gw["id"],
                            "name": gw["name"],
                            "deadline_time": datetime.fromisoformat(
                                gw["deadline_time"]
                            ),
                            "average_entry_score": gw["average_entry_score"],
                            "finished": gw["finished"],
                            "data_checked": gw["data_checked"],
                            "is_current": gw["is_current"],
                            "is_next": gw["is_next"],
                        }
                        for gw in data["events"]
                    ],
                    ["gameweek_id"],
                ),
            ]
            for table, records, keys in tables:
                self.db.batch_upsert_on_conflict(table, records, keys)
            logger.info("✅ Bootstrap data synced successfully.")
            return True
        except Exception as e:
            logger.exception("❌ Error syncing bootstrap data")
            return False

    def sync_all_league_members_history(self, entry_id: int, pages: int = 2) -> bool:
        logger.info(f"🔁 Syncing league members for entry {entry_id} (pages={pages})")
        self.sync_user_data(entry_id)
        with self.db.engine.connect() as conn:
            result = conn.execute(
                select(mini_leagues.c.league_id, mini_leagues.c.name).where(
                    and_(
                        mini_leagues.c.entry_id == entry_id,
                        mini_leagues.c.league_type == "x",
                    )
                )
            ).fetchall()
        if not result:
            logger.warning(f"No leagues found for entry {entry_id}")
            return False
        all_success = True
        with ThreadPoolExecutor(
            max_workers=min(self.MAX_WORKERS, len(result))
        ) as executor:
            futures = [
                executor.submit(
                    self._process_single_league, lid, lname, entry_id, pages
                )
                for lid, lname in result
            ]
            for future in as_completed(futures):
                try:
                    if not future.result():
                        all_success = False
                except Exception as e:
                    logger.error(f"League processing failed: {e}")
                    all_success = False
        return all_success


if __name__ == "__main__":
    db = SQLAlchemyConnector(
        user="bcheye", password="password", host="localhost", database="fpl_db"
    )
    fpl = FPLDataSync(db)
    fpl.sync_all_league_members_history(
        entry_id=3530111, pages=5
    )  # Fetch 3 pages instead of default 2
