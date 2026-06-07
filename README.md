# ⭐ Store Rating Web Application

A full-stack Store Rating Platform that enables users to browse stores, submit ratings, and manage store-related data through a secure role-based system.

Built with **React, TypeScript, Node.js, Express.js, MySQL, JWT Authentication, and Zod Validation**.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* Single login system for all users
* JWT-based authentication
* Role-Based Access Control (RBAC)
* Secure password hashing
* Session persistence

### 👤 User Roles

#### System Administrator

* Create Admin, User, and Store Owner accounts
* Register new stores
* Assign store owners
* View platform statistics
* Manage users and stores
* Filter and sort records

#### Normal User

* Sign up and log in
* Browse all registered stores
* Search stores by name or address
* Submit ratings (1-5 stars)
* Modify submitted ratings
* Change password

#### Store Owner

* View average store rating
* See users who rated their store
* Sort reviewer information
* Change password

---

## 📊 Dashboard Features

### Admin Dashboard

* Total Users
* Total Stores
* Total Ratings

### Store Owner Dashboard

* Average Store Rating
* List of Submitted Ratings
* Reviewer Information

### User Dashboard

* Store Listing
* Search & Filter Stores
* Submit/Edit Ratings

---

## 🛡️ Input Validation

The application validates data on both frontend and backend.

### Name

* Minimum: 20 characters
* Maximum: 60 characters

### Address

* Maximum: 400 characters

### Password

* Length: 8-16 characters
* At least one uppercase letter
* At least one special character

Example:

Password123!

### Email

* Standard email validation

---

## 📈 Sorting & Filtering

All major tables support:

* Ascending/Descending Sorting
* Multi-field Filtering
* Search Functionality

Supported fields:

* Name
* Email
* Address
* Role
* Rating
* Date

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Context API
* Custom HSL CSS
* Glassmorphism UI

### Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Zod Validation

### Database

* MySQL
* mysql2/promise

---

## 📂 Project Structure

```text
Store_Rating_App
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── App.tsx
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── schema.sql
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js (v18+ recommended)
* MySQL Server
* npm

Ensure MySQL is running on:

```text
localhost:3306
```

Default configuration:

```text
User: root
Password: (empty)
```

You can modify database credentials in:

```text
backend/.env
```

---

## ▶️ Run Backend

Navigate to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

---

## ▶️ Run Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite application:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## 🗄️ Database

The application automatically:

* Creates database
* Creates required tables
* Seeds sample data

No manual SQL execution is required.

Database Name:

```text
store_rating_db
```

---

## 🔑 Default Administrator Account

```text
Email: admin@storerating.com
Password: Password123!
```

---

## 🧪 Test Credentials

### Admin

```text
Email: admin@storerating.com
Password: admin@storerating
```

### Normal User

```text
Email: pranavmal@storerating.com
Password: Pranav@123
```

### Store Owner

```text
Email: torna@chaphe.com
Password: torna@chaphe
```

### Test User

```text
Email: usernumber1@user.com
Password: usernumber1@user
```

### Test Store Owner

```text
Email: storenumber1@store.com
Password: storenumber1@store
```

---

## 🎨 UI Features

* Glassmorphism Design
* Responsive Layout
* Dark Theme
* Loading Indicators
* Error Handling
* Interactive Star Ratings
* Modern User Experience

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Role-Based Access Control
* Input Validation
* Secure API Middleware

---

## 👨‍💻 Author

**Pranav Mahadik**

GitHub:
https://github.com/your-github-username

---

## 📄 License

This project was developed as part of the Roxiler Systems Full Stack Intern Coding Challenge.
