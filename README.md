# Collab Notes App

## 📌 Project Overview
Collab Notes is a **real-time collaborative note-taking application** built using **Next.js, Express.js, MongoDB, and Socket.io**. It allows multiple users to create, edit, and view notes simultaneously with **real-time synchronization**. The application implements **JWT-based authentication** with **access & refresh tokens** to ensure secure access and session management.

## 🚀 Features
- **User Authentication** (Signup/Login/Logout) using JWT (Access & Refresh Tokens)
- **Real-Time Collaboration** with WebSockets (Socket.io)
- **Live Updates** when multiple users edit the same note
- **Secure Token Storage** (HTTP-only cookies for refresh tokens, access tokens in memory)
- **Role-Based Protected Routes** for authenticated users
- **Server-Side Rendering (SSR)** with Next.js
- **Responsive UI** built with Tailwind CSS

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js (React 19)** - Frontend framework with SSR support
- **Tailwind CSS** - UI styling
- **Socket.io-client** - WebSocket client for real-time updates
- **Axios** - HTTP requests
- **React Hook Form + Zod** - Form validation

### **Backend**
- **Express.js** - Backend framework
- **MongoDB + Mongoose** - Database for storing users and notes
- **Socket.io** - WebSockets for real-time collaboration
- **JSON Web Token (JWT)** - Authentication system
- **bcrypt** - Password hashing
- **cookie-parser** - Handling secure HTTP-only cookies

---

## 📂 Folder Structure
```
/collab-notes-app
│── backend/              # Express.js server
│   ├── controllers/      # Authentication & notes logic
│   ├── middlewares/      # JWT authentication middleware
│   ├── models/          # MongoDB schemas (User, Notes)
│   ├── routes/          # API routes (Auth, Notes)
│   ├── utils/           # Helper functions (JWT, hashing)
│   ├── .env.example     # Example environment variables
│   ├── index.js         # Entry point
│
│── frontend/             # Next.js client
│   ├── components/      # Reusable UI components
│   ├── context/         # Auth context for JWT handling
│   ├── pages/           # Next.js pages (SSR)
│   ├── utils/           # Axios instance & API handlers
│   ├── .env.example     # Example environment variables
│   ├── package.json     # Dependencies & scripts
```

---

## ⚙️ Environment Variables

Before running the project, set up your **.env** files using the provided `.env.example` in both **frontend** and **backend** directories.

### Backend `.env`
```
PORT=5000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🏃‍♂️ Getting Started

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/asif-ae/collab-notes-app.git
cd collab-notes-app
```

### 2️⃣ Install Dependencies
#### Backend
```sh
cd backend
npm install
```
#### Frontend
```sh
cd frontend
npm install
```

### 3️⃣ Start the Development Server
#### Backend
```sh
cd backend
npm run dev
```
#### Frontend
```sh
cd frontend
npm run dev
```

---

## 🔐 Authentication Flow
1. User **signs up** (credentials are hashed and stored in MongoDB).
2. User **logs in**:
   - Receives **access token** (short-lived) and **refresh token** (long-lived, stored in an HTTP-only cookie).
3. On protected routes, the **access token** is sent in headers for authentication.
4. When the access token expires, the frontend sends a request to **refresh the token** using the refresh token.
5. On **logout**, the refresh token is deleted, invalidating the session.

---

## 🔄 Real-Time Collaboration (Socket.io)
1. Users **join a note room** when opening a note.
2. When one user makes edits, changes are **broadcasted to all users** in the same room.
3. The frontend listens for **real-time updates** and syncs content live.

---

## 🛠️ API Endpoints

### **Authentication Routes** (`/api/auth`)
| Method | Endpoint          | Description         |
|--------|-----------------|---------------------|
| POST   | `/signup`       | User registration  |
| POST   | `/login`        | User login         |
| POST   | `/refresh-token` | Refresh JWT token |
| POST   | `/logout`       | User logout        |

### **Notes Routes** (`/api/notes`)
| Method | Endpoint         | Description                |
|--------|----------------|----------------------------|
| GET    | `/`            | Fetch all notes           |
| GET    | `/:id`         | Fetch a single note       |
| POST   | `/`            | Create a new note         |
| PATCH  | `/:id`         | Update an existing note   |
| DELETE | `/:id`         | Delete a note             |

### **Socket.io Events**
| Event         | Description                           |
|--------------|-----------------------------------|
| `join-note`  | User joins a note room            |
| `edit-note`  | User makes changes to a note     |
| `receive-changes` | Broadcasts updates to all users |

---

## 🛠️ Possible Future Improvements
✅ **Role-based access control (RBAC)**
✅ **Markdown support in notes**
✅ **Version history & undo functionality**
✅ **Google OAuth for authentication**

---

## 🤝 Contributing
Contributions are welcome! If you'd like to contribute, follow these steps:
1. **Fork** the repo
2. Create a **new branch**: `git checkout -b feature-name`
3. **Commit changes**: `git commit -m "Added feature X"`
4. **Push to branch**: `git push origin feature-name`
5. Open a **Pull Request**

---

## 📜 License
This project is **MIT Licensed** – you're free to modify and distribute it.

---

## 📧 Contact
For questions, feel free to **open an issue** or **contact** me at [dev.asif.ae@gmail.com].

