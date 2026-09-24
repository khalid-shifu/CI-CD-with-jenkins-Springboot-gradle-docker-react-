# Car registry practice project

This workspace contains a Spring Boot + Gradle backend and a React + Vite frontend.

## Backend

Requirements: Java 17+, Gradle, and MySQL.

```powershell
cd backend
gradle bootRun
```

The backend runs at `http://localhost:8080` and connects to MySQL with:

- database: `cars` (created automatically)
- username: `root`
- password: `root`

API endpoints:

```http
GET  /api/cars
POST /api/cars
Content-Type: application/json

{
  "model": "Civic Sport",
  "year": 2024,
  "color": "#1c365b"
}
```

## Frontend

Requirements: Node.js 18+.

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` after starting the backend.
