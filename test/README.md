# Store Rating Web Application

A full-stack, professional-grade store rating platform featuring role-based access control, rich data tables with dynamic sorting and filtering, and interactive rating submissions.

## Tech Stack
- **Backend:** Node.js, Express.js, TypeScript, JWT (JSON Web Tokens), Zod Validation
- **Database:** MySQL (using `mysql2/promise` with automatic DB/table creation and seeding)
- **Frontend:** React, TypeScript, Vite, Custom HSL styled CSS (Glassmorphism & Dark Mode)

---

## Key Features

### 👤 1. Shared Authentication (Single Login System)
A unified login page redirects users to their specific dashboard based on their role:
- **System Administrator:** Manage users, register stores, assign store owners, and view system stats.
- **Normal User:** Browse stores, search by name/address, rate stores (1-5 stars), edit their rating, and change password.
- **Store Owner:** View average ratings and reviews for their store in real-time, sort reviewer profiles, and change password.

### 🛡️ 2. Strict Input Validation (Frontend & Backend)
Enforces precise rules:
- **Name/Store Name:** Min 20 characters, Max 60 characters. *(Note: Must use long names like `Alexander Bartholomew Cunningham` or `Pranav Sahil Randil Chaudhary` when testing!)*
- **Address:** Max 400 characters.
- **Password:** 8-16 characters, containing at least one uppercase letter and one special character (e.g., `Password123!`).
- **Email:** Standard email format.

### 📊 3. Sorting & Filtering
All lists and tables support dynamic ascending/descending sorting for key columns (Name, Email, Address, Role, Rating, Date) and multiple concurrent filters.

---

## Project Structure
```
test/
├── backend/
│   ├── src/
│   │   ├── config/          # DB Connection Pool, Env Vars
│   │   ├── controllers/     # Auth, Store, Rating, User controllers
│   │   ├── middlewares/     # JWT Auth, Role checking, Zod Validation
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # Zod validation schemas
│   │   └── index.ts         # Server entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable StarRating component
│   │   ├── context/         # AuthContext for session management
│   │   ├── pages/           # Admin, Normal User, and Store Owner views
│   │   ├── utils/           # Fetch API client wrapper
│   │   ├── index.css        # Premium custom CSS system
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── schema.sql               # Database schema definition
└── README.md
```

---

## Installation & Setup

### Prerequisite
Ensure a local **MySQL server** is running on your machine (usually on port `3306`).
- Default setup connects using `root` and no password. 
- You can customize connection credentials in the `backend/.env` file.
- **The backend automatically creates the database (`store_rating_db`) and tables on startup!** No manual schema imports are required.

### 1. Run the Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the TypeScript development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000` and output: `Seeded default Admin user: admin@storerating.com / Password123!`*

### 2. Run the Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React client:
   ```bash
   npm run dev
   ```
   *The client will boot on `http://localhost:3000`.*

---

---

## Default Administrator Credentials
On initial startup, the database is pre-seeded with a default System Administrator account:
- **Email:** `admin@storerating.com`
- **Password:** `Password123!`

## Sample Test Credentials
The following accounts have been added for testing. 

> [!TIP]
> **Password Logic:** Unless specified otherwise, the password for these users is their **Email ID without the `.com`** (e.g., user `usernumber1@user.com` has password `usernumber1@user`).

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **System Admin** | `ADMIN` | `admin@storerating.com` | `admin@storerating` |
| **Pranav Sahil Randil Chaudhary** | `NORMAL` | `pranavmal@storerating.com` | `Pranav@123` |
| **Store Owner Torna** | `STORE_OWNER` | `torna@chaphe.com` | `torna@chaphe` |
| **User To Test One** | `NORMAL` | `usernumber1@user.com` | `usernumber1@user` |
| **Owner For Store One** | `STORE_OWNER` | `storenumber1@store.com` | `storenumber1@store` |

---

## Technical Details

### Backend Features
- **JWT Authentication**: Secure stateless authentication with role-based access control.
- **Zod Validation**: Robust input validation on all API endpoints.
- **Automatic DB Seeding**: Self-healing database initialization on startup.
- **RESTful Architecture**: Clean separation of concerns with controllers and routes.

### Frontend Features
- **Glassmorphism Design**: Modern, premium aesthetic using HSL variables and backdrop-filters.
- **Dynamic Sorting/Filtering**: Real-time table updates with multi-parameter filtering.
- **Responsive Modals**: Context-aware error handling and loading indicators.
- **Star Rating System**: Reusable, interactive star component for ratings.
- **RBAC Routing**: Automatic redirects based on user roles and session status.
