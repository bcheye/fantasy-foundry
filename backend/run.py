from flask import Flask
from routes.api import api_bp, auth_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://bcheye:password@localhost/fpl_db"
app.register_blueprint(api_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    app.run(debug=True)
