# EventHub 🎉

A comprehensive platform for hosting and managing college events. EventHub provides a centralized solution for students and administrators to create, discover, register, and manage various college activities.

**Version:** 1.0.0  
**Author:** Shivam Chaudhary  
**License:** ISC

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Models](#models)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- **User Authentication & Authorization**
  - User registration and login with JWT-based authentication
  - Role-based access control (Student, Admin, Organizer)
  - Secure password hashing with bcrypt
  - Persistent sessions with refresh tokens

- **Event Management**
  - Create, read, update, and delete events
  - Filter events by type, status, and date
  - Support for multiple event types and capacities
  - Prize management for competitive events

- **Team Management**
  - Create and manage teams for events
  - Invite team members and manage participation
  - Track team registrations for events

- **Event Scheduling**
  - Set event dates and times
  - Manage event schedules and timelines
  - View upcoming events

- **User Management**
  - User profiles with college information
  - View user activity and registrations
  - Update user information

- **Data Validation**
  - Input validation using Joi
  - Comprehensive error handling

---

## 🛠️ Tech Stack

### Backend Framework
- **Express.js** (v5.2.1) - Web framework for Node.js
- **Node.js** - JavaScript runtime

### Database
- **MongoDB** - NoSQL database
- **Mongoose** (v9.3.1) - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken)** (v9.0.3) - Token-based authentication
- **bcrypt** (v6.0.0) - Password hashing
- **cookie-parser** (v1.4.7) - Cookie parsing middleware

### Utilities
- **Joi** (v18.0.2) - Schema validation
- **CORS** (v2.8.6) - Cross-Origin Resource Sharing
- **dotenv** (v17.3.1) - Environment variable management
- **Nodemon** (v3.1.14) - Development server auto-reload

---

## 📁 Project Structure

```
event/
├── src/
│   ├── controller/              # Business logic
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── event.controller.js  # Event management
│   │   ├── schedule.controller.js # Event scheduling
│   │   ├── teams.controller.js  # Team management
│   │   └── user.controller.js   # User management
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js   # Authentication checks
│   │   ├── role.middleware.js   # Role-based authorization
│   │   └── validate.js          # Request validation
│   │
│   ├── model/                   # Database schemas
│   │   ├── db.js                # Database connection
│   │   ├── user.model.js        # User schema
│   │   ├── event.model.js       # Event schema
│   │   ├── registraton.model.js # Registration schema
│   │   └── schedule.model.js    # Schedule schema
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.route.js        # Auth endpoints
│   │   ├── event.route.js       # Event endpoints
│   │   ├── teams.routes.js      # Team endpoints
│   │   ├── schedule.route.js    # Schedule endpoints
│   │   └── user.routes.js       # User endpoints
│   │
│   ├── utils/                   # Utility functions
│   │   └── generateTokens.js    # JWT token generation
│   │
│   └── validators/              # Validation schemas
│       └── joi.validate.js      # Joi validation rules
│
├── app.js                       # Express app setup
├── index.js                     # Server entry point
├── package.json                 # Project dependencies
└── .env                         # Environment variables
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the root directory
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Configuration section)

---

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/eventhub
# OR for MongoDB Atlas
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/eventhub

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# JWT Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5500
```

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/eventhub` |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | Any strong random string |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | Any strong random string |
| `JWT_ACCESS_EXPIRY` | Access token expiry time | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry time | `7d` |
| `CORS_ORIGIN` | Allowed frontend URL | `http://localhost:5500` |

---

## ▶️ Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with hot-reload enabled using Nodemon.

### Production Mode
```bash
node index.js
```

The server will start at `http://localhost:8000`

### Test the Connection
```bash
curl http://localhost:8000/test
```
Expected response: `Hii !! welcome to event managing website and server is started`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Routes (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh access token |

### Event Routes (`/events`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Create new event |
| GET | `/events` | Get all events |
| GET | `/events/:id` | Get event details |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |

### Team Routes (`/teams`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teams` | Create new team |
| GET | `/teams` | Get all teams |
| GET | `/teams/:id` | Get team details |
| PUT | `/teams/:id` | Update team |
| DELETE | `/teams/:id` | Delete team |

### Schedule Routes (`/schedule`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/schedule` | Create event schedule |
| GET | `/schedule` | Get all schedules |
| GET | `/schedule/:id` | Get schedule details |
| PUT | `/schedule/:id` | Update schedule |
| DELETE | `/schedule/:id` | Delete schedule |

### User Routes (`/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update user profile |
| GET | `/user/:id` | Get user details |
| DELETE | `/user/:id` | Delete user account |

---

## 🔐 Middleware

### 1. **Authentication Middleware** (`auth.middleware.js`)
- Validates JWT tokens from cookies
- Extracts and verifies user information
- Prevents unauthorized access to protected routes

### 2. **Role-Based Authorization** (`role.middleware.js`)
- Checks user role (Student, Admin, Organizer)
- Restricts access based on role permissions
- Implements role-specific features

### 3. **Request Validation** (`validate.js`)
- Validates incoming request data using Joi schemas
- Ensures data integrity
- Provides detailed validation error messages

### 4. **Built-in Middleware**
- `express.json()` - Parse JSON request bodies
- `express.urlencoded()` - Parse URL-encoded bodies
- `cookieParser()` - Parse cookies
- `cors()` - Enable Cross-Origin Resource Sharing

---

## 📊 Database Models

### User Model
```javascript
{
  firstname: String (required),
  lastname: String,
  email: String (required, unique),
  password: String (required, hashed),
  role: String (Student, Admin, Organizer),
  collegename: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  name: String (required),
  type: String (required),
  status: String,
  date: Date (required),
  time: String,
  venue: String,
  maxTeams: Number,
  prize: String,
  description: String,
  collegename: String,
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Registration Model
```javascript
{
  userId: ObjectId (User),
  eventId: ObjectId (Event),
  teamId: ObjectId (Team),
  status: String,
  registeredAt: Date
}
```

### Schedule Model
```javascript
{
  eventId: ObjectId (Event),
  date: Date,
  time: String,
  venue: String,
  description: String,
  createdAt: Date
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📧 Contact

For questions or support, contact: **Shivam Chaudhary**

---

## 🎯 Future Enhancements

- [ ] Email notifications for event updates
- [ ] Payment integration for premium events
- [ ] Real-time notifications using WebSockets
- [ ] File upload for event banners and attachments
- [ ] Advanced event filtering and search
- [ ] Analytics dashboard for event organizers
- [ ] Mobile app integration

---

**Happy Event Planning! 🎉**
