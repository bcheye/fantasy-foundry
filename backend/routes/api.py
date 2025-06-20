from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash

from services.data_sync import FPLDataSync
from db.connector import SQLAlchemyConnector
from db.schema import (
    players,
    mini_leagues,
    mini_league_entries,
    mini_league_gameweek_scores,
    teams,
    positions,
    overview,
    gameweeks,
    gameweek_history,
    users,
)
from sqlalchemy import select, func, desc

api_bp = Blueprint("api", __name__)

auth_bp = Blueprint("auth", __name__)

db = SQLAlchemyConnector(
    user="bcheye",
    password="password",
    host="localhost",
    database="fpl_db",
    debug=True,
)

data_sync = FPLDataSync(db)


@api_bp.route("/sync/bootstrap", methods=["POST"])
def sync_bootstrap():
    try:
        data_sync.sync_bootstrap_data()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route("/sync/user/<int:entry_id>", methods=["POST"])
def sync_user(entry_id):
    try:
        if data_sync.sync_user_data(entry_id):
            return jsonify({"status": "success"}), 200
        return jsonify({"status": "failed"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@api_bp.route("sync/history/<int:entry_id>", methods=["POST"])
def sync_gameweeks_history(entry_id):
    try:
        if data_sync.sync_gameweeks_history_data(entry_id):
            return jsonify({"status": "success"}), 200
        return jsonify({"status": "failed"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


@api_bp.route("/players", methods=["GET"])
def get_players():
    with db.engine.connect() as conn:
        result = conn.execute(players.select().limit(100))
        return jsonify([dict(row) for row in result.mappings()])


@api_bp.route("/gameweeks/<int:entry_id>", methods=["GET"])
def get_gameweeks_history_data(entry_id):
    with db.engine.connect() as conn:
        result = conn.execute(
            gameweek_history.select().where(gameweek_history.c.entry_id == entry_id)
        )
        return jsonify([dict(row) for row in result.mappings()])


@api_bp.route("/top_performing_players", methods=["GET"])
def get_top_performing_players():
    """
    Returns top performing players with their position and team names
    Optional query parameters:
    - limit: number of players to return (default: 10)
    - position: filter by position type ID
    """
    try:
        # Get query parameters
        limit = request.args.get("limit", default=10, type=int)
        position = request.args.get("position", type=int)

        with db.engine.connect() as conn:
            query = (
                select(
                    players.c.player_id,
                    players.c.name.label("player_name"),
                    players.c.total_points,
                    players.c.cost,
                    positions.c.singular_name.label("position"),
                    teams.c.name.label("team"),
                )
                .select_from(
                    players.join(
                        positions,
                        players.c.position_type_id == positions.c.position_type_id,
                    ).join(teams, players.c.team == teams.c.team_id)
                )
                .order_by(desc(players.c.total_points))
            )

            # Apply filters if provided
            if position:
                query = query.where(players.c.position_type_id == position)

            # Apply limit
            query = query.limit(limit)

            result = conn.execute(query)
            top_players = [dict(row) for row in result.mappings()]

            return (
                jsonify(top_players),
                200,
            )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "message": f"Failed to fetch top players: {str(e)}"}
            ),
            500,
        )


@api_bp.route("/overview/<int:entry_id>", methods=["GET"])
def get_overview(entry_id):
    with db.engine.connect() as conn:
        # Get current gameweek
        current_gw = conn.execute(
            select(gameweeks.c.gameweek_id).where(gameweeks.c.is_current == True)
        ).scalar()

        if not current_gw:
            return (
                jsonify({"success": False, "message": "No current gameweek found"}),
                404,
            )

        # Get overview for entry_id and current gameweek
        query = select(overview).where(
            (overview.c.entry_id == entry_id)
            & (overview.c.current_gameweek == current_gw)
        )

        result = conn.execute(query)
        data = [dict(row) for row in result.mappings()]

        if not data:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": f"No data found for entry {entry_id} in current gameweek",
                    }
                ),
                404,
            )

        return jsonify(data[0])


@api_bp.route("/minileagues/<int:entry_id>", methods=["GET"])
def get_minileagues(entry_id):
    with db.engine.connect() as conn:
        # Subquery to get the latest gameweek for each league
        latest_gw_subq = (
            select(
                mini_league_gameweek_scores.c.league_id,
                func.max(mini_league_gameweek_scores.c.gameweek).label("latest_gw"),
            )
            .group_by(mini_league_gameweek_scores.c.league_id)
            .subquery()
        )

        query = (
            select(
                mini_leagues,
                mini_league_entries.c.rank,
                mini_league_entries.c.total,
                mini_league_gameweek_scores.c.points.label("latest_gw_points"),
            )
            .select_from(
                mini_leagues.join(
                    mini_league_entries,
                    mini_leagues.c.league_id == mini_league_entries.c.league_id,
                )
                .join(
                    latest_gw_subq,
                    mini_leagues.c.league_id == latest_gw_subq.c.league_id,
                )
                .join(
                    mini_league_gameweek_scores,
                    (
                        mini_leagues.c.league_id
                        == mini_league_gameweek_scores.c.league_id
                    )
                    & (mini_league_gameweek_scores.c.entry_id == entry_id)
                    & (
                        mini_league_gameweek_scores.c.gameweek
                        == latest_gw_subq.c.latest_gw
                    ),
                )
            )
            .where(mini_league_entries.c.entry_id == entry_id)
        )

        result = conn.execute(query)
        return jsonify([dict(row) for row in result.mappings()])


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    with db.engine.connect() as conn:
        user = conn.execute(
            users.select().where(users.c.email == data["email"])
        ).first()

        if not user or not check_password_hash(user.password_hash, data["password"]):
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({"message": "Login successful", "entryId": user.fpl_entry_id})


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    if not data or not all(k in data for k in ("email", "password", "entryId")):
        return jsonify({"error": "Missing fields"}), 400

    try:
        with db.engine.begin() as conn:  # use .begin() for transaction context
            if conn.execute(
                users.select().where(users.c.email == data["email"])
            ).first():
                return jsonify({"error": "Email already exists"}), 400

            conn.execute(
                users.insert().values(
                    email=data["email"],
                    password_hash=generate_password_hash(data["password"]),
                    fpl_entry_id=data["entryId"],
                )
            )
        return jsonify({"message": "Registration successful"}), 201

    except Exception as e:
        import traceback

        traceback.print_exc()  # log full error to console
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
