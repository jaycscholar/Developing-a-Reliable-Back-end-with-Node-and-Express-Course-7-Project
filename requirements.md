# EMS — Employee Management System

A simple fullstack application for managing employee records, built with Node.js/Express and React. Backend runs locally; frontend can be deployed to Vercel. Database upgrade planned for later.

---

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Backend  | Node.js, Express.js               |
| Frontend | React (Vite)                      |
| Storage  | JSON file (`data/employees.json`) |
| Deploy   | Vercel (frontend only for now)     |

---

## Project Structure

```
course-end-project-node/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── data/
│   │   └── employees.json     # JSON file data store
│   ├── routes/
│   │   └── employees.js       # Employee CRUD routes
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── EmployeeForm.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── requirements.md
```

---

## Backend Requirements

### 1. Project Setup
- Initialize a Node.js project with `npm init`
- Install dependencies: `express`, `cors`, `uuid`
- Add a `dev` script using `node --watch` for local development

### 2. Data Storage
- Use the `fs` module to read from and write to `data/employees.json`
- No database required — all data persists in the JSON file
- Seed the file with a few sample employee records

**Employee schema:**
```json
{
  "id": "uuid-string",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "department": "Engineering",
  "salary": 85000
}
```

### 3. API Routes (`/api/employees`)

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/api/employees`      | Retrieve all employees       |
| GET    | `/api/employees/:id`  | Retrieve a single employee   |
| POST   | `/api/employees`      | Create a new employee        |
| PUT    | `/api/employees/:id`  | Update an existing employee  |
| DELETE | `/api/employees/:id`  | Delete an employee           |

- Return appropriate HTTP status codes (200, 201, 404, 400, 500)
- Validate required fields on POST and PUT (`firstName`, `lastName`, `email`)
- Enable CORS so the frontend can communicate with the API

### 4. Server Entry Point (`server.js`)
- Create the Express app, apply middleware (CORS, JSON parsing), and mount routes
- Listen on port `3000` (or `process.env.PORT`)

---

## Frontend Requirements

### 1. Project Setup
- Scaffold with Vite + React: `npm create vite@latest client -- --template react`
- Install any needed dependencies (e.g., `axios` or use native `fetch`)

### 2. Pages / Views
Keep it to a single page with the following sections:

#### Employee List
- Fetch and display all employees in a table on load
- Show columns: Name, Email, Department, Salary, Actions
- Each row has **Edit** and **Delete** buttons

#### Add / Edit Employee Form
- A simple form with fields: First Name, Last Name, Email, Department, Salary
- On submit, send a POST (create) or PUT (update) request to the API
- After success, refresh the employee list
- Basic client-side validation (required fields, valid email format)

#### Navbar
- App title ("Employee Management System")
- An "Add Employee" button that shows/focuses the form

### 3. Styling
- Keep it minimal — use plain CSS or a lightweight library (e.g., classless CSS)
- Responsive enough to work on desktop and mobile

### 4. Dev Proxy
- Configure `vite.config.js` to proxy `/api` requests to `http://localhost:3000` during development

---

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev          # starts Express on http://localhost:3000

# Frontend (separate terminal)
cd client
npm install
npm run dev          # starts Vite on http://localhost:5173 with proxy to backend
```

---

## Future Improvements

- Upgrade from JSON file storage to a real database (MongoDB, PostgreSQL, etc.)
- Deploy the backend to a Node.js hosting service (Render, Railway, Fly.io)
- Deploy the frontend to Vercel pointing at the hosted backend

---

## Nice-to-Haves (optional, not required)

- Search / filter employees by name or department
- Sort table columns
- Confirmation dialog before deleting
- Toast notifications for success/error feedback
- Loading spinners during API calls
