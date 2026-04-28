# 🍽️ Location Multi Cuisine Restaurant Management System

A premium, full-stack web application for managing a Middle Eastern and South Indian restaurant. Features a sleek dark-gold design, real-time administrative controls, and a robust SQLite backend.

## 🚀 Features

### **For Customers**

- **Premium UI/UX**: Elegant, responsive design with smooth animations.
- **Dynamic Menu**: Browse items by category (Biryani, Grills, Shawarma, etc.) with real-time availability.
- **Order System**: Add items to cart, apply coupons, and choose between Delivery/Takeaway.
- **Order Tracking**: Real-time progress bar from "Accepted" to "Delivered".
- **Table Reservations**: Secure table booking with date/time selection and occasion notes.
- **User Dashboard**: View order history, active reservations, and manage profile.

### **For Admin**

- **Central Dashboard**: Visual statistics on revenue, orders, and popular items.
- **Menu Management**: Add, edit, or delete dishes. Toggle availability instantly.
- **Order Management**: Process incoming orders and update statuses.
- **Reservation Handling**: Approve or reject table bookings and assign table numbers.
- **Automated Billing**: Generate digital invoices automatically upon order delivery.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **Database**: SQLite with Sequelize ORM (Lightweight & Self-contained).
- **Authentication**: JWT (JSON Web Tokens) with secure password hashing (Bcrypt).

## 📁 Project Structure

```text
├── frontend/             # Client-side files
│   ├── css/              # Stylesheets (index.css, admin.css, etc.)
│   ├── js/               # Logic (menu.js, cart.js, auth.js, etc.)
│   ├── admin/            # Admin dashboard pages
│   └── images/           # High-quality food and UI assets
├── backend/              # Server-side logic
│   ├── config/           # Database & Seeding configuration
│   ├── controllers/      # Route handlers (Business logic)
│   ├── models/           # Sequelize database models
│   ├── routes/           # API endpoints
│   └── data/             # SQLite database file storage
└── README.md             # Project documentation
```

## 🚥 Getting Started

### **1. Prerequisites**

- Node.js (v18.0 or higher)

### **2. Backend Setup**

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### **3. Database Seeding**

Initialize the SQLite database with the default menu and admin account:

```bash
npm run seed
```

### **4. Run the Application**

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`.

### **5. Accessing the Website**

- **Customer Side**: Open `frontend/index.html` in your browser or visit `http://localhost:5000`.
- **Admin Panel**: Access via `frontend/admin/admin-dashboard.html` or the "Dashboard" link in the navigation (Requires admin login).

## 🔑 Default Credentials

| Role         | Email                          | Password       |
| :----------- | :----------------------------- | :------------- |
| **Admin**    | `admin@locationrestaurant.com` | `Admin@1234`   |
| **Customer** | `customer@example.com`         | `Customer@123` |

---

_Created for Location Multi Cuisine Restaurant — A premium dining experience._
