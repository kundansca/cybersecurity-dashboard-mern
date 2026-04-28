# CISA KEV Dashboard (MERN)

This is a small full-stack project built using the MERN stack. It uses the CISA Known Exploited Vulnerabilities (KEV) dataset and displays the data in a dashboard along with a searchable CVE table.

---

## Dataset

Download the dataset from here:

https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json

Note: The dataset is not included in the repository. Please download it manually.

---

## Requirements

- Node.js (v18 or above)
- MongoDB (local or Atlas)

---

## Tech Stack

- Frontend: React (Vite) + Ant Design
- Backend: Node.js + Express
- Database: MongoDB

## 1. MongoDB Setup

Add your MongoDB connection string in the `.env` file:

MONGODB_URI=your_connection_string  
MONGODB_DB_NAME=kev_catalog

---

## 2. Backend Setup

cd backend  
npm install

If `.env` file is not present, copy it from `.env.example`.

### Import Data

This will clear existing data and insert fresh records:

npm run ingest -- path/to/known_exploited_vulnerabilities.json

If the file is inside `backend/data/`, run:

npm run ingest

### Run Backend

npm run dev

Backend runs on port 5000 (or as set in `.env`).

---

## 3. Frontend Setup

cd frontend  
npm install  
npm run dev

Frontend runs on:  
http://localhost:5173

---

## Live Demo

https://cybersecurity-dashboard-frontend.onrender.com

---

## Features

### Dashboard

- Total vulnerabilities count
- Ransomware usage breakdown
- Top vendors
- Monthly added vulnerabilities
- CWE distribution

### Vulnerabilities Table

- Paginated CVE list
- Filters: vendor, product, ransomware, date range
- Search functionality
- Click row to view more details

---

## API Endpoints

All endpoints are under `/api`

- GET /api/health
- GET /api/vulnerabilities
- GET /api/vulnerabilities/:cveId
- GET /api/stats/summary
- GET /api/stats/top-vendors
- GET /api/stats/cwe-distribution
- GET /api/stats/additions-by-month

---

## Design Notes

- Each vulnerability is stored as a separate document
- Proper indexing is used for better performance
- MongoDB aggregation is used for stats
- Dates are handled carefully to avoid timezone issues

---

## Before Running

Make sure:

- You have installed dependencies in both backend and frontend
- Dataset is imported using the ingest script
- Backend and frontend are running
- Data is visible in the UI

If data is not showing, check MongoDB connection and API URL.

Also, do not commit the `.env` file.

---

## Why I Built This

This project was built to practice working with real-world data, MongoDB queries, and building a clean dashboard using React.

---

## Author

Kundan Kumar Singh
