# ⚽ Fantasy Foundry

**Fantasy Foundry** is a full-stack analytics platform for Fantasy Premier League (FPL) data, built to help FPL managers gain deep insights, visualize trends, and dominate mini-leagues with data-driven decisions.

---

## 🧱 Tech Stack

- **Python** – ETL scripts to extract and transform FPL data
- **PostgreSQL** – Centralized relational database
- **Cube** – Analytics API layer with REST/GraphQL support
- **Flask + Chart.js** – Frontend dashboard for data exploration
- *(Optional: Docker for deployment, Prefect for scheduling)*

---

## 🚀 Features (Planned)

- Player performance dashboards (points, value, ownership)
- Fixture difficulty planning
- Team and mini-league tracking
- Transfer trends and alerts
- Real-time xPoints (expected points) modeling (Phase 2)

---

## 📂 Project Structure

```plaintext
fantasyfoundry/
│
├── backend/                  - Python ETL  
│   ├── etl/                  - fetch, transform, load  
│   ├── db/                   - schema & DB utilities  
│   └── requirements.txt  
│
├── analytics/                - Cube.js API layer  
│   ├── schema/               - Cube schemas (players, teams)  
│   └── .env 
│
├── frontend/                 - React web app  
│   └── src/  
│
├── docker-compose.yml        - (Optional) Full-stack container  
└── README.md
```
---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/bcheye/fantasy-foundry.git
cd fantasyfoundry
```

### 2. Backend (Python ETL)
- **Install Dependencies:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python etl/fetch_fpl.py
```
Make sure you have PostgreSQL running and update your connection string in the ETL script.


### 3. Analytics (Cube)
```bash
cd analytics
npm install
npm run dev
```
Update your .env with your PostgreSQL credentials.

### 4. Frontend (React)
```bash
cd frontend
npm install
npm start
```


## 📅 Roadmap
	•	Create initial ETL pipeline for players & teams
	•	Define Cube schema
	•	Build React dashboard layout
	•	Add player comparison and fixture planner views
	•	Deploy to Vercel + Render/Docker

⸻

## 🤝 Contributions

Pull requests and feature ideas welcome! Open an issue or fork the project to get started.

⸻

## 📜 License

MIT License – feel free to use, remix, and improve!

⸻

## 🎯 Author


Built with ❤️ by Brian · Powered by FPL, Flask & Cube.js. Fueled by FPL obsession


