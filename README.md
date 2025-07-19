# Rebel Fitness - GYM Management System

A full-featured web application designed to manage gym memberships, class schedules, and overall gym operations. Built with a powerful backend and an interactive frontend, it offers dedicated interfaces for administrators, gym staff, and members enabling each role to efficiently handle tasks such as managing users, tracking attendance, updating schedules, and accessing personalized gym information.

### Admin Panel
- Manage gyms, trainers, and members
- View and manage class schedules
- Process payments and track revenue
- Generate reports and analytics
- User role management (Admin, Gym, Member)

### Gym Owner Features
- Manage gym profile and information
- View member attendance
- Track payments and revenue
- Manage class schedules

### Member Features
- View class schedules
- Book and manage class reservations
- View payment history
- Update profile information

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios 
- React Icons
- React Toastify 
- Jwt-decode

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT 
- Bcrypt 
- Express Validator
- CORS 
- Mongoose
- dotenv
- nodemon
- zod

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeya-prashanth/Gym-Management-System.git
   cd GYM_Management_System

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
3. **Frontend Setup**
   ```bash
   cd frontend
   npm install 

4. **Environment Variables**
   Create a `.env` file in both `backend` and `frontend` directories with the following variables:

   **Backend (.env)**
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d

   **Frontend (.env)**
   VITE_API_URL=http://localhost:5000/api/v1

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run start

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Tokens are stored in HTTP-only cookies for security.

## API Documentation

API documentation is available at `http://localhost:5000/api-docs` when running the development server.
