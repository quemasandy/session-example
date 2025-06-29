# 🔐 Session & Cookie Management Demo

A comprehensive TypeScript application demonstrating **session-based authentication** with Redis storage. This project provides an educational deep-dive into how sessions and cookies work in web applications, including all the "hidden" details that are typically abstracted away.

## 🚀 Features

- **Complete Session Lifecycle**: Login, authentication, logout with detailed logging
- **Redis Session Storage**: Persistent sessions with automatic expiration
- **Real-time Session Monitoring**: Advanced Redis monitoring tools
- **Educational Logging**: Detailed console output explaining each step
- **TypeScript Throughout**: Full type safety on both frontend and backend
- **Modern Tech Stack**: Express.js, Vite, Redis with Docker

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with session middleware
- **Session Store**: Redis with connect-redis
- **Authentication**: Session-based with HttpOnly cookies
- **Security**: CORS configuration for cross-origin requests

### Frontend
- **Language**: TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Modern CSS with gradients and animations
- **API Client**: Fetch API with credentials for cookie management

### Infrastructure
- **Database**: Redis for session persistence
- **Containerization**: Docker Compose for Redis
- **Monitoring**: Custom Redis monitoring tools

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** v16.0.0 or higher
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** for Redis
- **Git** for version control

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/session-example.git
cd session-example
```

### 2. Start Redis with Docker
```bash
docker compose up -d redis
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 5. Start the Backend Server
```bash
cd ../backend
npm run dev
```
The backend will start at: http://localhost:3000

### 6. Start the Frontend Development Server
```bash
cd ../frontend
npm run dev
```
The frontend will start at: http://localhost:5173

## 🧪 Testing the Application

### Demo Users
The application includes three test users:

| Username | Password  | Description |
|----------|-----------|-------------|
| juan     | 123456    | Standard user |
| maria    | password  | Standard user |
| admin    | admin123  | Admin user |

### Testing Steps

1. **Open Browser DevTools** (F12)
   - Go to **Network** tab to see HTTP requests
   - Go to **Application/Storage** tab to see cookies
   - Go to **Console** tab to see detailed logs

2. **Test Authentication Flow**
   - Try logging in with valid credentials
   - Observe the session cookie being set
   - Test protected routes (Profile, Secret Data)
   - Try logging out and see cookie deletion

3. **Observe Session Details**
   - Watch the backend console for detailed session logs
   - Use the Redis monitor tools (see below)
   - Notice how cookies are sent automatically

## 🔍 What to Observe

### In the Browser
- **Automatic Cookie Creation**: Session cookie appears after successful login
- **Automatic Cookie Transmission**: Cookie sent with every request
- **UI State Changes**: Interface updates based on authentication status
- **Network Requests**: See Set-Cookie and Cookie headers in DevTools

### In the Backend Console
- **Session Creation**: Detailed logs when user logs in
- **Automatic Verification**: Session checking on each protected request
- **Session Destruction**: Cleanup process during logout
- **Redis Operations**: Database interactions for session storage

### In Redis
- **Session Storage**: Key-value pairs with session data
- **TTL Management**: Automatic expiration of old sessions
- **Data Structure**: JSON serialized user information

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/login` - Authenticate user and create session
- `POST /api/logout` - Destroy session and clear cookie
- `GET /api/check-session` - Check current authentication status (public)

### Protected Routes
- `GET /api/profile` - Get user profile (requires authentication)
- `GET /api/secret-data` - Access protected data (requires authentication)

## 🍪 Session Configuration

The application uses the following session settings:

```typescript
session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'demo-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
})
```

### Security Features
- **HttpOnly Cookies**: Prevents XSS attacks by making cookies inaccessible to JavaScript
- **HTTPS in Production**: Secure flag ensures cookies only sent over HTTPS
- **Session Signing**: Secret key prevents session tampering
- **Redis Storage**: Sessions persist across server restarts

## 🔍 Redis Session Monitoring

This project includes advanced Redis monitoring tools to help you understand session storage:

### Monitor Commands

```bash
cd backend

# List all active sessions
npm run monitor:list

# Watch Redis operations in real-time
npm run monitor:monitor

# Show session statistics
npm run monitor:stats

# Clean expired sessions
npm run monitor:clean

# Continuous monitoring (updates every 5 seconds)
npm run monitor:watch
```

### Monitor Output Example

```bash
🔍 Monitor de Sesiones Redis iniciado...

📊 2 sesiones activas:

🔑 sess:vCmLec24WRMXOD_Uo5hr7Au8LAb6RFKp
⏰ TTL: 86345s
📄 Datos:
{
  \"cookie\": {
    \"originalMaxAge\": 86400000,
    \"expires\": \"2024-01-15T14:30:20.000Z\",
    \"secure\": false,
    \"httpOnly\": true,
    \"path\": \"/\"
  },
  \"userId\": \"1\",
  \"username\": \"juan\",
  \"isAuthenticated\": true
}
```

## 🏗️ Project Structure

```
session-example/
├── backend/                 # Express.js backend
│   ├── src/
│   │   └── server.ts       # Main server file with session logic
│   ├── redis-monitor.js    # Redis monitoring utility
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── frontend/               # Vite frontend
│   ├── src/
│   │   └── app.ts          # Main TypeScript application
│   ├── index.html          # HTML entry point
│   ├── style.css           # Application styles
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── docker-compose.yml      # Redis container configuration
└── README.md              # This file
```

## 🔄 Session Flow Explained

### 1. Login Process
```
Client → POST /api/login → Server
Server → Validates credentials → Creates session data
Server → Modifies req.session → express-session detects changes
express-session → Generates session ID → Stores in Redis
express-session → Creates signed cookie → Adds Set-Cookie header
Server → Sends response → Client automatically stores cookie
```

### 2. Authenticated Request
```
Client → Includes cookie automatically → GET /api/profile
Server → express-session reads cookie → Retrieves session from Redis
Server → Populates req.session → Runs requireAuth middleware
Middleware → Checks authentication → Allows/denies access
Server → Returns protected data → Client receives response
```

### 3. Logout Process
```
Client → POST /api/logout → Server
Server → req.session.destroy() → Removes session from Redis
Server → res.clearCookie() → Tells browser to delete cookie
Server → Sends confirmation → Client no longer has session
```

## 🧪 Development & Testing

### Running Tests
```bash
# Backend linting (if configured)
cd backend
npm run lint

# Frontend linting (if configured)
cd frontend
npm run lint

# Build production versions
npm run build
```

### Environment Variables

Create a `.env` file in the backend directory:
```env
# Session configuration
SESSION_SECRET=your-super-secret-key-here
NODE_ENV=development

# Redis configuration (optional)
REDIS_URL=redis://localhost:6379

# Server configuration
PORT=3000
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   - Set `SESSION_SECRET` to a strong, random string
   - Set `NODE_ENV=production` for security features
   - Configure `REDIS_URL` for production Redis instance

2. **HTTPS Configuration**
   - Enable `secure: true` for cookies in production
   - Use HTTPS reverse proxy (nginx, Apache)
   - Update CORS origins to production domains

3. **Redis Security**
   - Use Redis authentication in production
   - Configure Redis networking and firewall rules
   - Set up Redis persistence and backups

### Docker Deployment

```bash
# Build production images
docker build -t session-demo-backend ./backend
docker build -t session-demo-frontend ./frontend

# Run with docker-compose
docker-compose up -d
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add comprehensive JSDoc comments
- Include error handling for all async operations
- Test session edge cases (expiration, corruption, etc.)
- Update documentation for new features

## 📚 Learning Resources

This project demonstrates these key concepts:

- **Session vs Token Authentication**: When to use each approach
- **Cookie Security**: HttpOnly, Secure, SameSite attributes
- **Redis Session Storage**: Benefits of external session storage
- **CORS with Credentials**: Cross-origin cookie handling
- **Session Lifecycle**: Creation, validation, expiration, cleanup

### Recommended Reading

- [Express Session Documentation](https://github.com/expressjs/session)
- [Redis Documentation](https://redis.io/documentation)
- [HTTP Cookies (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [CORS with Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)

## ⚠️ Security Notes

**This is an educational demo. For production use:**

1. **Hash passwords** with bcrypt or similar
2. **Use environment variables** for all secrets
3. **Implement rate limiting** for login attempts
4. **Add CSRF protection** for forms
5. **Validate and sanitize** all user inputs
6. **Use HTTPS** in production
7. **Implement proper logging** and monitoring

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name** - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) for the web framework
- [Redis](https://redis.io/) for session storage
- [Vite](https://vitejs.dev/) for the frontend build tool
- [TypeScript](https://www.typescriptlang.org/) for type safety
- The open-source community for inspiration and tools

---

**Made with ❤️ for learning session management concepts**