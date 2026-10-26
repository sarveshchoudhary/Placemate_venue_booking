# 🚀 PlaceMate

### Smart Classroom & Equipment Booking Platform

PlaceMate is a centralized booking platform designed for colleges and educational institutions to manage classroom and equipment reservations efficiently.

It provides an intuitive interface for users to browse resources, submit booking requests, track approval status, and cancel bookings when needed. Administrators can manage all reservations through a dedicated dashboard.

---

## ✨ Features

- 🏫 Classroom booking
- 🎥 Equipment booking
- 🔒 Global date-and-time conflict prevention
- ✅ Admin approval and rejection workflow
- 👤 User authentication with login and signup
- 📋 Personal booking history
- ❌ Classroom and equipment booking cancellation
- 📊 Admin booking management dashboard
- 📁 File upload endpoint
- 🌐 Responsive web interface
- ⚡ REST API built with Node.js and Express.js
- 🗄️ MySQL database integration

---

## 🧠 Smart Booking Protection

PlaceMate prevents overlapping reservations across the entire system, including bookings for different classrooms and equipment.

For example, if a resource is booked from **10:00 AM to 11:00 AM**, another booking that overlaps this time slot on the same date will be rejected.

**Example of conflicting bookings:**

```text
Booking 1: 10:00 AM - 11:00 AM
Booking 2: 10:30 AM - 11:30 AM
Result: HTTP 409 Conflict
```

**Back-to-back bookings are allowed:**

```text
Booking 1: 10:00 AM - 11:00 AM
Booking 2: 11:00 AM - 12:00 PM
Result: Allowed
```

The backend uses transactional database logic and a MySQL advisory lock to help prevent concurrent requests from creating conflicting bookings.

---

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Poppins Google Font
- Responsive UI design

### Backend
- Node.js
- Express.js
- MySQL
- MySQL2
- CORS
- dotenv
- Multer
- bcryptjs

### Additional Components
- gRPC service definitions
- Docker configuration
- Kubernetes deployment manifests
- Distributed file-system utilities

---

## 📁 Project Structure

```text
placemate/
├── Index.html
├── about.html
├── admin.html
├── booking.html
├── equipment.html
├── equipment-booking.html
├── login.html
├── signup.html
├── profile.html
├── venues.html
├── styles.css
├── script.js
│
└── backend/
    ├── server.js
    ├── package.json
    ├── config/
    │   └── database.js
    ├── controllers/
    │   └── bookingController.js
    ├── routes/
    │   └── bookingRoutes.js
    ├── models/
    ├── middleware/
    ├── grpc/
    ├── dfs/
    └── k8s/
```

*Note: The structure above reflects the intended project layout. Adjust it to match the files and folders actually present in your repository.*

---

## ⚙️ Prerequisites

Install the following before running PlaceMate:

- Node.js 18 or later
- npm
- MySQL 8 or later
- Python 3 (for serving the frontend locally)

Verify your installations:

```bash
node --version
npm --version
mysql --version
python --version
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sarveshchoudhary/placemate.git
cd placemate
```

### 2. Install Dependencies

Install root-level dependencies if your project has a root `package.json`:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

---

## 🔐 Environment Configuration

Create a `.env` file inside the `backend` directory.

**File:** `backend/.env`

```env
PORT=3002

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=pm_db
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
```

Replace `your_mysql_password` with your local MySQL password.

> **Security:** Never commit your `.env` file or database credentials to GitHub. Add `.env` to your `.gitignore` file.

---

## 🗄️ Database Configuration

Make sure your MySQL server is running.

Create the database:

```sql
CREATE DATABASE pm_db;
```

Select the database:

```sql
USE pm_db;
```

Create the required tables using the schema expected by the backend models and controllers.

**Important:** Creating the database alone does not create the user and booking tables. Ensure the required schema is available before starting the application.

---

## ▶️ Running the Application

### 1. Start the Backend

Open a terminal:

```bash
cd backend
npm start
```

The backend should be available at:

```text
http://localhost:3002
```

You can check the backend status by opening:

```text
http://localhost:3002/
```

### 2. Start the Frontend

Open a second terminal from the project root:

```bash
python -m http.server 5500 --bind 127.0.0.1
```

Open the application in your browser:

**http://127.0.0.1:5500/Index.html**

Make sure the frontend API configuration points to the backend running at `http://localhost:3002`.

---

## 🔌 Main API Endpoints

The following endpoints describe the application's API interface. Confirm their implementation in the backend before relying on them.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check backend status |
| `POST` | `/api/signup` | Register a new user |
| `POST` | `/api/login` | Authenticate a user |
| `POST` | `/api/logout` | Log out a user |
| `POST` | `/api/book` | Create a classroom or equipment booking |
| `GET` | `/api/bookings` | Retrieve all bookings |
| `GET` | `/api/my-bookings?email=...` | Retrieve a user's bookings |
| `DELETE` | `/api/bookings/venue/:id` | Cancel a classroom booking |
| `DELETE` | `/api/bookings/equipment/:id` | Cancel an equipment booking |
| `PUT` | `/api/update-status` | Approve or reject a booking |
| `POST` | `/api/upload` | Upload a file |

---

## 👥 User Workflow

1. Create an account or log in.
2. Browse available classrooms or equipment.
3. Select a date and time.
4. Submit a booking request.
5. Wait for administrator approval.
6. View booking details and approval status on the profile page.
7. Cancel a booking when necessary.

---

## 🛡️ Admin Workflow

Administrators can:

- View classroom and equipment bookings.
- Approve or reject booking requests.
- Monitor reservation dates and time slots.
- Manage booking requests through the admin dashboard.

---

## 🔒 Security and Reliability

PlaceMate incorporates the following security and reliability measures, where implemented in the backend:

- Password hashing with `bcryptjs`.
- Parameterized MySQL queries.
- User-owned booking cancellation.
- Server-side booking validation.
- Overlapping time-slot prevention.
- Transactional booking creation.
- MySQL advisory locking for concurrent requests.
- Environment-based configuration.
- Protection of sensitive credentials through `.gitignore`.

---

## 🧪 Testing the Booking Conflict Rule

To test booking conflict prevention:

1. Create a booking for a specific date and time.
2. Submit another booking that overlaps the existing time slot.
3. Verify that the second request is rejected.

**Expected HTTP status:**

```text
409 Conflict
```

**Expected response message:**

```text
This date and time are already booked. Please choose another slot.
```

Also test back-to-back bookings to verify that adjacent time slots are accepted.

---

## 📸 Application Pages

The application includes pages for:

- Home
- About
- Classrooms
- Equipment
- Classroom booking
- Equipment booking
- Login and signup
- User profile and booking history
- Admin dashboard
- Reviews
- Contact

---

## 🌱 Future Improvements

Potential enhancements include:

- Real-time availability calendar.
- Email notifications.
- Stronger role-based access control.
- Database migrations and schema versioning.
- Automated unit and integration testing.
- Booking analytics and reporting.
- Mobile application support.
- Cloud deployment.
- Payment integration.
- Advanced equipment quantity management.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes.
4. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```

5. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request.

---

## 👨‍💻 Author

### Sarvesh Choudhary

- **GitHub:** [@sarveshchoudhary](https://github.com/sarveshchoudhary)
- **Project Repository:** [PlaceMate on GitHub](https://github.com/sarveshchoudhary/placemate)

---

## 📄 License

This project is intended for educational and institutional use.

Before distributing it publicly as an open-source project, add an appropriate license, such as the MIT License, if its terms suit your intended use.
