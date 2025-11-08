# SN Meetup - Project & Task Management System

A full-stack project and task management application built with Next.js, MongoDB, and Socket.IO. Features include Kanban boards, real-time updates, automations, and notifications.

## Features

- 🔐 User authentication (JWT-based)
- 📋 Project management
- ✅ Task management with Kanban boards
- 🔔 Real-time notifications via WebSocket
- ⚙️ Automation rules
- 👥 Team collaboration
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT with HTTP-only cookies
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Yup validation

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sn-meetup
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/sn-meetup
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod
# Or use MongoDB Atlas and update MONGODB_URI in .env.local
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sn-meetup/
├── lib/                           # Server-side utilities and models
│   ├── db.js                      # MongoDB connection
│   ├── models/                    # Mongoose models
│   │   ├── User.js               # User model
│   │   ├── Project.js            # Project model
│   │   ├── Task.js               # Task model
│   │   ├── Automation.js         # Automation model
│   │   └── Notification.js       # Notification model
│   ├── services/                  # Business logic services
│   │   ├── automationService.js  # Automation execution logic
│   │   └── notificationService.js # Notification creation logic
│   ├── socket/                    # Socket.IO server and handlers
│   │   ├── server.js             # Socket.IO server initialization
│   │   └── handlers/             # Socket event handlers
│   │       ├── taskHandlers.js   # Task-related socket events
│   │       └── notificationHandlers.js # Notification socket events
│   ├── middleware/                # Server middleware
│   │   ├── auth.js               # Authentication middleware
│   │   └── rateLimit.js          # Rate limiting middleware
│   └── utils/                     # Utility functions
│       ├── auth.js               # JWT token utilities
│       ├── performance.js        # Performance utilities
│       └── sanitize.js           # Input sanitization
├── src/
│   ├── app/                       # Next.js app directory
│   │   ├── api/                   # API routes
│   │   │   ├── auth/             # Authentication routes
│   │   │   ├── projects/         # Project routes
│   │   │   ├── tasks/            # Task routes
│   │   │   ├── automations/      # Automation routes
│   │   │   ├── notifications/    # Notification routes
│   │   │   └── socket/           # Socket route
│   │   ├── projects/              # Project pages
│   │   ├── login/                 # Login page
│   │   ├── register/              # Registration page
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Home page
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   │   ├── automations/          # Automation components
│   │   ├── notifications/        # Notification components
│   │   ├── projects/             # Project components
│   │   ├── tasks/                # Task components
│   │   ├── Header.js             # App header
│   │   ├── Providers.js          # Context providers
│   │   └── ProtectedRoute.js     # Route protection
│   ├── context/                   # React contexts
│   │   ├── AuthContext.js        # Authentication context
│   │   └── SocketContext.js      # Socket context
│   └── hooks/                     # Custom React hooks
│       ├── useProjects.js        # Project hooks
│       ├── useTasks.js           # Task hooks
│       ├── useNotifications.js   # Notification hooks
│       └── ...                   # Other custom hooks
├── server.js                      # Custom Next.js server with Socket.IO
├── middleware.js                  # Next.js middleware
└── package.json                   # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark notifications as read

### Automations
- `GET /api/automations?projectId=[id]` - List automations
- `POST /api/automations` - Create automation
- `GET /api/automations/[id]` - Get automation details
- `PATCH /api/automations/[id]` - Update automation
- `DELETE /api/automations/[id]` - Delete automation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/sn-meetup` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `JWT_EXPIRE` | JWT token expiration | `30d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

## Features in Detail

### Authentication
- Secure JWT-based authentication
- HTTP-only cookies for token storage
- Password hashing with bcrypt

### Real-time Updates
- WebSocket connections via Socket.IO
- Real-time task updates
- Live notifications
- Project room-based messaging

### Kanban Boards
- Drag-and-drop task management
- Multiple status columns (todo, in-progress, review, done)
- Task priorities and assignments
- Due dates and descriptions

### Automations
- Trigger-based automations
- Status change triggers
- Assignment triggers
- Priority change triggers
- Custom actions (update status, assign user, send notification)

## Development

The project uses:
- **Next.js 16** with App Router
- **React 19** with React Compiler
- **Tailwind CSS 4** for styling
- **Mongoose** for MongoDB ODM
- **Socket.IO** for real-time features

## License

MIT
