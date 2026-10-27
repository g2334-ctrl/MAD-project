# Smart Ambulance Tracking & Emergency Response System (MAD Project)

A real-time emergency healthcare coordination platform connecting ambulances, hospitals, traffic controllers, and emergency dispatchers.

---

## 🚑 Project Overview

The **Smart Ambulance Tracking & Emergency Response System** streamlines critical emergency operations by offering live GPS tracking, automated nearest-hospital routing, traffic-clearing alerts, and real-time patient vitals telemetry between ambulance paramedics and hospital emergency departments.

---

## 📁 Repository Structure

```
MAD-project/
├── smart-ambulancebackend/     # Node.js + Express + MongoDB + Socket.io backend API
└── smart-ambulancefrontend/    # React (Vite) + Leaflet Maps + Lucide Icons frontend client
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io
- **Security & Auth**: JSON Web Tokens (JWT), bcryptjs
- **Environment**: Dotenv, Nodemon

### Frontend
- **Framework**: React 18 with Vite
- **Mapping & Geolocation**: Leaflet & React-Leaflet
- **Real-time Client**: Socket.io Client
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Backend Setup
```bash
cd smart-ambulancebackend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and adjust variables as needed:
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/smart_ambulance
# JWT_SECRET=your_jwt_secret
# CLIENT_ORIGIN=http://localhost:5173

# Seed sample hospital and route data (optional)
npm run seed

# Run in development mode
npm run dev
```

### 2. Frontend Setup
```bash
cd smart-ambulancefrontend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file if needed:
# VITE_API_URL=/api
# VITE_SOCKET_URL=/

# Run development server
npm run dev
```

The frontend will run by default at `http://localhost:5173/` and backend API at `http://localhost:5000/`.

---

## 📄 License
This project is developed as part of the MAD coursework.
