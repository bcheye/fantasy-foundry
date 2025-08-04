import requests
from datetime import datetime
from sqlalchemy import select, and_
from db.connector import SQLAlchemyConnector
from db.schema import (
    players,
    teams,
    gameweeks,
    positions,
    mini_leagues,
    mini_league_entries,
    mini_league_gameweek_scores,
    overview,
    gameweek_history,
)


class FPLDataSync:
    BASE_URL = "https://fantasy.premierleague.com/api"

    def __init__(self, db: SQLAlchemyConnector):
        self.db = db

    def sync_bootstrap_data(self) -> bool:
        """Sync all static data from bootstrap-static endpoint into the database."""

        try:
            response = requests.get(f"{self.BASE_URL}/bootstrap-static/", timeout=10)
            response.raise_for_status()
            data = response.json()

            teams_data = [
                {
                    "team_id": t["id"],
                    "name": t["name"],
                    "short_name": t["short_name"],
                    "strength_overall_home": t["strength_overall_home"],
                    "strength_overall_away": t["strength_overall_away"],
                }
                for t in data["teams"]
            ]
            self.db.batch_upsert_on_conflict(teams, teams_data, ["team_id"])

            positions_data = [
                {
                    "position_type_id": p["id"],
                    "singular_name": p["singular_name"],
                    "plural_name": p["plural_name_short"],
                }
                for p in data["element_types"]
            ]
            self.db.batch_upsert_on_conflict(
                positions, positions_data, ["position_type_id"]
            )

            players_data = [
                {
                    "player_id": p["id"],
                    "first_name": p["first_name"],
                    "second_name": p["second_name"],
                    "name": p["web_name"],
                    "team": p["team"],
                    "position_type_id": p["element_type"],
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
            ]
            self.db.batch_upsert_on_conflict(players, players_data, ["player_id"])

            gameweeks_data = [
                {
                    "gameweek_id": gw["id"],
                    "name": gw["name"],
                    "deadline_time": datetime.fromisoformat(gw["deadline_time"]),
                    "average_entry_score": gw["average_entry_score"],
                    "finished": gw["finished"],
                    "data_checked": gw["data_checked"],
                    "is_current": gw["is_current"],
                    "is_next": gw["is_next"],
                }
                for gw in data["events"]
            ]
            self.db.batch_upsert_on_conflict(gameweeks, gameweeks_data, ["gameweek_id"])

            return True

        except requests.exceptions.RequestException as req_err:
            print(f"❌ Network or API error syncing bootstrap data: {req_err}")
            raise req_err
        except Exception as e:
            print(f"❌ Error syncing bootstrap data: {e}")
            raise e

    def sync_user_data(self, entry_id: int) -> bool:
        """
        Syncs general user/team (entry_id) data, specifically their
        mini-league memberships (metadata) and initial team info.
        This function no longer handles gameweek scores.
        """
        try:
            entry_response = requests.get(
                f"{self.BASE_URL}/entry/{entry_id}/", timeout=10
            )
            entry_response.raise_for_status()
            entry_data = entry_response.json()

            leagues_data = entry_data.get("leagues", {})

            mini_league_entries_data = []
            mini_leagues_data = []
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

            if "classic" in leagues_data:
                for league in leagues_data["classic"]:
                    # mini_leagues table
                    mini_leagues_data.append(
                        {
                            "entry_id": entry_id,
                            "league_id": league["id"],
                            "name": league["name"],
                            "created": (
                                datetime.fromisoformat(league["created"][:-1])
                                if league["created"]
                                else None
                            ),
                            "league_type": league.get("league_type"),
                        }
                    )

                    # mini_league_entries table
                    mini_league_entries_data.append(
                        {
                            "entry_id": entry_id,
                            "entry_name": entry_data["name"],
                            "player_name": f"{entry_data['player_first_name']} {entry_data['player_last_name']}",
                            "rank": league["entry_rank"],
                            "total": entry_data.get(
                                "summary_overall_points"
                            ),  # Optional: store points
                            "league_id": league["id"],
                        }
                    )

            if overview_data:
                self.db.batch_upsert_on_conflict(
                    overview, overview_data, ["entry_id", "current_gameweek"]
                )
            if mini_leagues_data:
                self.db.batch_upsert_on_conflict(
                    mini_leagues, mini_leagues_data, ["entry_id", "league_id"]
                )

            if mini_league_entries_data:
                self.db.batch_upsert_on_conflict(
                    mini_league_entries,
                    mini_league_entries_data,
                    ["entry_id", "league_id"],
                )

            return True

        except requests.exceptions.RequestException as req_err:
            print(f"Network/API error while syncing entry {entry_id}: {req_err}")
            raise req_err
        except Exception as e:
            print(f"Unexpected error syncing entry {entry_id}: {e}")
            raise e

    def sync_live_gameweek_data(self, event_id: int) -> bool:
        """Sync live stats data for a specific gameweek into the players table."""
        try:
            live_response = requests.get(
                f"{self.BASE_URL}/event/{event_id}/live/", timeout=10
            )
            live_response.raise_for_status()
            live_data = live_response.json()

            player_stats = []
            for player in live_data["elements"]:
                stats = player["stats"]
                player_stats.append(
                    {
                        "player_id": player["id"],
                        "minutes": stats["minutes"],
                        "goals_scored": stats["goals_scored"],
                        "assists": stats["assists"],
                        "clean_sheets": stats["clean_sheets"],
                        "yellow_cards": stats["yellow_cards"],
                        "red_cards": stats["red_cards"],
                    }
                )

            if player_stats:
                self.db.batch_upsert_on_conflict(players, player_stats, ["player_id"])

            return True

        except requests.exceptions.RequestException as req_err:
            print(
                f"Network/API error syncing live data for gameweek {event_id}: {req_err}"
            )
            raise req_err
        except Exception as e:
            print(f"Unexpected error syncing live data for gameweek {event_id}: {e}")
            raise e

    def sync_fixtures(self) -> bool:
        """Sync fixture data"""
        try:
            fixtures_response = requests.get(f"{self.BASE_URL}/fixtures/", timeout=10)
            fixtures_response.raise_for_status()
            fixtures_data = fixtures_response.json()

            print(f"Received {len(fixtures_data)} fixtures")
            return True

        except requests.exceptions.RequestException as req_err:
            print(f"Network or API error syncing fixtures: {req_err}")
            return False
        except Exception as e:
            print(f"Error syncing fixtures: {e}")
            return False

    def sync_gameweeks_history_data(self, entry_id: int) -> bool:
        try:
            gameweek_history_data = []

            # Fetch gameweek history
            history_resp = requests.get(
                f"{self.BASE_URL}/entry/{entry_id}/history/", timeout=10
            )
            history_resp.raise_for_status()
            history_data = history_resp.json()

            for gw in history_data.get("current", []):
                gameweek_history_data.append(
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
                )
            if gameweek_history_data:
                self.db.batch_upsert_on_conflict(
                    gameweek_history,
                    gameweek_history_data,
                    ["entry_id", "gameweek"],
                )
            return True
        except requests.exceptions.RequestException as e:
            print(f"Network or API error: {e}")
            raise e
            return False
        except Exception as ex:
            raise ex
            return False

    def sync_league_managers_data(self, league_id: int) -> bool:
        """
        Sync data for all managers (entries) within a specified mini-league.
        This includes league info, entry details, and historical gameweek scores.
        """
        page = 1
        has_next = True
        all_entries_synced = True

        print(f"🔄 Starting sync for league ID: {league_id}")

        while has_next:
            try:
                league_url = f"{self.BASE_URL}/leagues-classic/{league_id}/standings/?page={page}"
                print(f"➡ Fetching standings page {page}: {league_url}")
                response = requests.get(league_url, timeout=15)
                response.raise_for_status()
                league_data = response.json()

                # Upsert basic league info
                if "standings" in league_data and "league" in league_data:
                    league_info = league_data["league"]
                    self.db.batch_upsert_on_conflict(
                        mini_leagues,
                        [
                            {
                                "league_id": league_info["id"],
                                "name": league_info["name"],
                                "created": (
                                    datetime.fromisoformat(league_info["created"][:-1])
                                    if league_info["created"]
                                    else None
                                ),
                                "league_type": "x",
                            }
                        ],
                        ["league_id"],
                    )

                if "standings" in league_data and "results" in league_data["standings"]:
                    entries = league_data["standings"]["results"]
                    print(f"📄 Page {page} contains {len(entries)} entries.")

                    mini_league_entries_batch = []
                    mini_league_gameweek_scores_batch = []

                    for entry in entries:
                        entry_id = entry["entry"]
                        entry_name = entry["entry_name"]
                        player_name = entry["player_name"]
                        print(f"  ➕ Processing entry: {entry_name} ({entry_id})")

                        try:
                            # Fetch entry metadata
                            entry_resp = requests.get(
                                f"{self.BASE_URL}/entry/{entry_id}/", timeout=10
                            )
                            entry_resp.raise_for_status()
                            entry_data = entry_resp.json()

                            # Fetch gameweek history
                            history_resp = requests.get(
                                f"{self.BASE_URL}/entry/{entry_id}/history/", timeout=10
                            )
                            history_resp.raise_for_status()
                            history_data = history_resp.json()

                            # Add entry to batch
                            mini_league_entries_batch.append(
                                {
                                    "entry_id": entry_id,
                                    "entry_name": entry_data["name"],
                                    "player_name": f"{entry_data['player_first_name']} {entry_data['player_last_name']}",
                                    "rank": entry["rank"],
                                    "total": entry["total"],
                                    "league_id": league_id,
                                }
                            )

                            # Add gameweek scores to batch
                            for gw in history_data.get("current", []):
                                mini_league_gameweek_scores_batch.append(
                                    {
                                        "entry_id": entry_id,
                                        "league_id": league_id,
                                        "gameweek": gw["event"],
                                        "points": gw["points"],
                                        "cost": gw["event_transfers_cost"],
                                    }
                                )

                        except requests.exceptions.RequestException as ind_err:
                            print(f"  ❌ Request error for entry {entry_id}: {ind_err}")
                            all_entries_synced = False
                            raise ind_err
                        except Exception as ex:
                            print(f"  ❌ Processing error for entry {entry_id}: {ex}")
                            all_entries_synced = False
                            raise ex

                    # Perform batch upserts
                    if mini_league_entries_batch:
                        self.db.batch_upsert_on_conflict(
                            mini_league_entries,
                            mini_league_entries_batch,
                            ["entry_id", "league_id"],
                        )

                    if mini_league_gameweek_scores_batch:
                        self.db.batch_upsert_on_conflict(
                            mini_league_gameweek_scores,
                            mini_league_gameweek_scores_batch,
                            ["entry_id", "gameweek", "league_id"],
                        )

                    has_next = league_data["standings"]["has_next"]
                    page += 1 if has_next else 0
                else:
                    print(
                        f"⚠ No standings found for league {league_id} on page {page}."
                    )
                    has_next = False

            except requests.exceptions.RequestException as req_err:
                print(f"❌ Network error on league {league_id}, page {page}: {req_err}")
                all_entries_synced = False
                has_next = False
                raise req_err
            except Exception as e:
                print(f"❌ General error on league {league_id}, page {page}: {e}")
                all_entries_synced = False
                has_next = False
                raise e

        print(
            f"{'✅ All entries synced successfully' if all_entries_synced else '⚠ Sync completed with some issues'} for league {league_id}."
        )
        return all_entries_synced

    def sync_all_invitational_classic_leagues_for_user(
        self, user_entry_id: int
    ) -> bool:
        """
        Orchestrates syncing all managers from invitational classic leagues (type 'x') that a user is part of.
        Filters out any excluded league IDs, then syncs entries and scores for each relevant league.
        """
        print(
            f"\n🔍 Checking invitational classic leagues for user entry ID: {user_entry_id}"
        )

        # Step 1: Sync the user's own data to populate their league memberships
        if not self.sync_user_data(user_entry_id):
            print(
                f"❌ Failed to sync data for entry {user_entry_id}. Aborting league sync."
            )
            return False

        # Step 2: Fetch relevant invitational leagues from the DB
        try:
            excluded_league_ids = [
                1194,
                1024840,
                780750,
                797211,
                1647816,
                1473122,
                1054607,
                1001856,
                866318,
                697404,
                154756,
                34236,
            ]

            with self.db.engine.connect() as conn:
                stmt = select(mini_leagues.c.league_id, mini_leagues.c.name).where(
                    and_(
                        mini_leagues.c.league_type == "x",
                        mini_leagues.c.league_id.notin_(excluded_league_ids),
                    )
                )
                result = conn.execute(stmt)
                leagues_to_sync = [(row.league_id, row.name) for row in result]

            if not leagues_to_sync:
                print(
                    f"ℹ No eligible invitational classic leagues (type 'x') found for entry ID {user_entry_id}."
                )
                return True

            print(
                f"✅ Found {len(leagues_to_sync)} invitational classic leagues (excluding {len(excluded_league_ids)}):"
            )
            for league_id, league_name in leagues_to_sync:
                print(f" • {league_name} (ID: {league_id})")

            # Step 3: Sync all manager data for each of the relevant leagues
            all_synced_successfully = True
            for league_id, _ in leagues_to_sync:
                print(f"\n🔄 Syncing managers for league ID {league_id}...")
                if not self.sync_league_managers_data(league_id):
                    print(f"❗ Issues occurred while syncing league ID: {league_id}")
                    all_synced_successfully = False

            return all_synced_successfully

        except Exception as e:
            print(f"❌ Error during invitational league sync: {e}")
            return False


# Initialize
db_connector = SQLAlchemyConnector(
    user="bcheye", password="password", host="localhost", database="fpl_db", debug=False
)


if __name__ == "__main__":
    # Entry ID to sync
    entry_id = 3530111

    # Initialize the sync service
    sync_service = FPLDataSync(db_connector)

    print(f"\n=== STARTING FULL SYNC for entry ID: {entry_id} ===")

    # if sync_service.sync_bootstrap_data():
    #     print("Done")
    # else:
    #     print(777)

    # # Step 1: Sync user data (includes league membership)
    if sync_service.sync_gameweeks_history_data(entry_id):
        print("✅ User data synced successfully.")
    else:
        print("❌ Failed to sync user data.")
    #
    # # Step 2: Sync all invitational classic leagues for the user
    # if sync_service.sync_all_invitational_classic_leagues_for_user(entry_id):
    #     print("✅ All invitational classic leagues synced successfully.")
    # else:
    #     print("❌ Some invitational classic leagues failed to sync.")
    #
    # # Step 3: Sync live gameweek data (you can set event_id dynamically or hardcode it)
    # from datetime import datetime
    #
    # current_event_id = datetime.now().isocalendar().week  # Optional placeholder
    #
    # if sync_service.sync_live_gameweek_data(current_event_id):
    #     print(f"✅ Live data for gameweek {current_event_id} synced successfully.")
    # else:
    #     print(f"❌ Failed to sync live data for gameweek {current_event_id}.")

    print("\n=== FULL SYNC COMPLETED ===")
