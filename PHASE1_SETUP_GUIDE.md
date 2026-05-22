# 🏥 Smart Hospital — Phase 1 Setup Guide

## 📁 Final Folder Structure

```
smart-hospital/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   └── authController.js      # All auth logic
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   └── User.js                # User Mongoose model
│   ├── routes/
│   │   └── authRoutes.js          # Auth API routes
│   ├── utils/
│   │   ├── email.js               # Nodemailer + OTP
│   │   └── jwt.js                 # Token generation
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── server.js                  # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar/
    │   │   │   └── Navbar.jsx
    │   │   ├── Hero/
    │   │   │   └── Hero.jsx
    │   │   ├── Sections/
    │   │   │   └── Sections.jsx   # About, Services, Departments, Doctors, Contact, Footer
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   └── DashboardPlaceholders.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios instance
    │   ├── App.jsx                # Routes
    │   ├── index.js
    │   └── index.css              # Tailwind + Google Fonts
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ Prerequisites

Make sure you have installed:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community  
  OR use **MongoDB Atlas** (free cloud) → https://cloud.mongodb.com
- **Git** (optional)

---

## 🚀 Step-by-Step Setup

### Step 1 — Set up Backend

```bash
cd smart-hospital/backend
npm install
```

### Step 2 — Configure Environment Variables

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_hospital
JWT_SECRET=any_long_random_string_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Smart Hospital <your_gmail@gmail.com>
CLIENT_URL=http://localhost:3000
OTP_EXPIRE_MINUTES=10
```

#### 📧 Gmail App Password Setup:
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** → Select app: "Mail" → Generate
4. Copy the 16-character password → paste as `EMAIL_PASS`

#### 🍃 MongoDB Atlas (Cloud, Free):
1. Register at https://cloud.mongodb.com
2. Create a free cluster
3. Click **Connect** → **Drivers** → copy the URI
4. Replace `<password>` with your DB password
5. Paste as `MONGO_URI`

### Step 3 — Start Backend

```bash
# Development (auto-restart on changes)
npm run dev

# OR production
npm start
```

✅ You should see:
```
🏥 Smart Hospital Server running on http://localhost:5000
✅ MongoDB Connected: localhost
```

---

### Step 4 — Set up Frontend

```bash
cd smart-hospital/frontend
npm install
```

### Step 5 — Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

> The `tailwind.config.js` is already provided. Just run the init to generate `postcss.config.js`.

### Step 6 — Start Frontend

```bash
npm start
```

✅ Opens at: **http://localhost:3000**

---

## 🔗 API Endpoints Reference

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/verify-otp` | Verify registration OTP | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| POST | `/api/auth/forgot-password` | Send reset OTP | No |
| POST | `/api/auth/verify-forgot-otp` | Verify reset OTP | No |
| POST | `/api/auth/reset-password` | Set new password | No |
| GET | `/api/auth/me` | Get current user | ✅ JWT |
| GET | `/api/health` | Health check | No |

### Test with curl:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Health check
curl http://localhost:5000/api/health
```

---

## 🌐 Pages Overview

| URL | Page | Access |
|-----|------|--------|
| `/` | Landing Page | Public |
| `/login` | Login | Public (redirect if logged in) |
| `/register` | Register + OTP | Public |
| `/forgot-password` | Reset Password | Public |
| `/patient/dashboard` | Patient Dashboard | Patient only |
| `/doctor/dashboard` | Doctor Dashboard | Doctor only |
| `/admin/dashboard` | Admin Dashboard | Admin only |
| `/receptionist/dashboard` | Receptionist Dashboard | Receptionist only |

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection failed` | Check if MongoDB is running: `mongod` |
| `Email not sending` | Verify Gmail App Password, not regular password |
| `CORS error` | Ensure `CLIENT_URL=http://localhost:3000` in `.env` |
| `npm install fails` | Use Node.js v18+, try `npm install --legacy-peer-deps` |
| `OTP not received` | Check spam folder, verify `EMAIL_USER` and `EMAIL_PASS` |
| `Tailwind not working` | Run `npx tailwindcss init -p` inside frontend/ |

---

## ✅ Phase 1 Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Frontend running on port 3000
- [ ] Landing page loads with all sections
- [ ] Register → OTP email → account created
- [ ] Login works and redirects to dashboard
- [ ] Forgot password → OTP → new password → login

---

## ➡️ What's Next

Type **Phase 2** to get:
- ✅ Full **Patient Dashboard** with sidebar
- ✅ **Appointment Booking** system  
- ✅ **Medical Reports** viewer/downloader
- ✅ **Prescriptions** viewer
- ✅ Full **Doctor Dashboard**
- ✅ Accept/reject appointments
- ✅ Write digital prescriptions
- ✅ Upload reports with Multer
