# 🛠️ Development Guide

This guide covers development setup, coding standards, testing procedures, and debugging techniques for the session management demo application.

## 🚀 Development Setup

### Prerequisites

Ensure you have the following installed:

```bash
# Check Node.js version (16+ required)
node --version

# Check npm version
npm --version

# Check Docker version
docker --version
docker-compose --version

# Check Git version
git --version
```

### Initial Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd session-example
   ```

2. **Start Infrastructure**
   ```bash
   # Start Redis in background
   docker-compose up -d redis
   
   # Verify Redis is running
   docker-compose ps
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment template (if exists)
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

### Development Workflow

```bash
# Terminal 1: Redis
docker-compose up redis

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Frontend  
cd frontend && npm run dev

# Terminal 4: Session Monitoring (optional)
cd backend && npm run monitor:watch
```

## 📝 Coding Standards

### TypeScript Configuration

Both frontend and backend use strict TypeScript configuration:

```json
{
  \"compilerOptions\": {
    \"strict\": true,
    \"noImplicitAny\": true,
    \"noImplicitReturns\": true,
    \"noFallthroughCasesInSwitch\": true
  }
}
```

### Code Style Guidelines

#### Naming Conventions

```typescript
// Interfaces: PascalCase
interface SessionData {
  userId: string;
}

// Functions: camelCase
function authenticateUser() {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';

// Files: kebab-case
// session-manager.ts, user-controller.ts
```

#### JSDoc Documentation

All functions should include comprehensive JSDoc comments:

```typescript
/**
 * Authenticates user credentials and creates session
 * 
 * @param username - User's login identifier
 * @param password - User's password (plain text for demo)
 * @returns Promise resolving to authentication result
 * @throws {AuthenticationError} When credentials are invalid
 * 
 * @example
 * ```typescript
 * const result = await authenticateUser('john', 'password123');
 * if (result.success) {
 *   console.log('Login successful');
 * }
 * ```
 */
async function authenticateUser(username: string, password: string): Promise<AuthResult> {
  // Implementation
}
```

#### Error Handling

Always use proper error handling patterns:

```typescript
// ✅ Good: Comprehensive error handling
try {
  const response = await fetchWithCredentials('/api/profile');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.message}`);
  }
  
  return data;
} catch (error) {
  console.error('Profile fetch failed:', error);
  throw error; // Re-throw for caller handling
}

// ❌ Bad: Silent failures
const data = await fetch('/api/profile').then(r => r.json()).catch(() => null);
```

#### Async/Await Usage

Prefer async/await over Promise chains:

```typescript
// ✅ Good: Clean async/await
async function loginUser(credentials: LoginCredentials) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// ❌ Avoid: Promise chains when async/await is clearer
function loginUser(credentials: LoginCredentials) {
  return fetch('/api/login', { /* options */ })
    .then(response => response.json())
    .then(result => result)
    .catch(error => {
      console.error('Login failed:', error);
      throw error;
    });
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

#### Authentication Flow Testing

- [ ] **Login with valid credentials**
  - Verify session cookie is set
  - Check backend logs for session creation
  - Confirm UI updates to authenticated state

- [ ] **Login with invalid credentials**
  - Ensure error message is displayed
  - Verify no session cookie is created
  - Check UI remains in login state

- [ ] **Protected route access**
  - Test `/api/profile` when authenticated
  - Test `/api/profile` when not authenticated
  - Verify 401 responses for unauthenticated requests

- [ ] **Logout functionality**
  - Confirm session is destroyed in Redis
  - Verify cookie is cleared from browser
  - Check UI returns to login state

#### Session Persistence Testing

- [ ] **Browser refresh**
  - Login and refresh page
  - Verify session persists
  - Check UI maintains authenticated state

- [ ] **Session expiration**
  - Wait for session timeout (or modify TTL)
  - Verify expired sessions are rejected
  - Check automatic cleanup

- [ ] **Cross-tab behavior**
  - Login in one tab
  - Open application in another tab
  - Verify session sharing works

#### Redis Integration Testing

- [ ] **Redis connectivity**
  - Stop Redis container
  - Verify graceful error handling
  - Restart Redis and test recovery

- [ ] **Session monitoring**
  - Use `npm run monitor:list` to view sessions
  - Use `npm run monitor:monitor` to watch operations
  - Verify session data structure

### Automated Testing Setup

```bash
# Backend testing (if implemented)
cd backend
npm test

# Frontend testing (if implemented)  
cd frontend
npm test

# Integration testing
npm run test:integration
```

### Testing with Curl

Test API endpoints directly:

```bash
# Login and capture session cookie
curl -c cookies.txt -X POST http://localhost:3000/api/login \
  -H \"Content-Type: application/json\" \
  -d '{\"username\":\"juan\",\"password\":\"123456\"}'

# Access protected route with session
curl -b cookies.txt http://localhost:3000/api/profile

# Logout
curl -b cookies.txt -X POST http://localhost:3000/api/logout
```

## 🐛 Debugging Techniques

### Backend Debugging

#### Session Debugging

The application includes extensive logging. Watch for these log patterns:

```bash
# Session creation
🔐 [14:30:20] 🚪 INTENTO DE LOGIN - Recibiendo credenciales...
🍪 [14:30:20] 🍪 SESIÓN CREADA - Datos guardados en req.session:

# Session verification
🔍 [14:30:25] 🔐 MIDDLEWARE DE AUTENTICACIÓN - Verificando sesión...

# Session destruction
🚪 [14:30:30] 🚪 LOGOUT - Usuario cerrando sesión...
```

#### Redis Debugging

Use the built-in monitoring tools:

```bash
# View all sessions
npm run monitor:list

# Monitor Redis operations in real-time
npm run monitor:monitor

# Check session statistics
npm run monitor:stats
```

#### Direct Redis Access

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# List all session keys
127.0.0.1:6379> KEYS sess:*

# Get session data
127.0.0.1:6379> GET sess:your-session-id

# Check TTL
127.0.0.1:6379> TTL sess:your-session-id
```

### Frontend Debugging

#### Browser DevTools Inspection

1. **Network Tab**
   - Look for `Set-Cookie` headers in login responses
   - Verify `Cookie` headers in subsequent requests
   - Check `credentials: 'include'` in request details

2. **Application Tab**
   - Navigate to Storage → Cookies
   - Look for `connect.sid` cookie
   - Verify HttpOnly flag (cookie not visible in JavaScript)

3. **Console Tab**
   - Watch for application logs
   - Check for CORS errors
   - Monitor session state changes

#### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| CORS Error | \"blocked by CORS policy\" | Check `credentials: true` in CORS config |
| No session cookie | Login succeeds but no cookie set | Verify `credentials: 'include'` in fetch |
| Session not persisting | Login works but refresh logs out | Check cookie HttpOnly and Secure flags |
| 401 on protected routes | Authentication appears successful | Verify session data in Redis |

### Environment-Specific Debugging

#### Development Issues

```bash
# Check if Redis is running
docker-compose ps

# View Redis logs
docker-compose logs redis

# Restart Redis if needed
docker-compose restart redis
```

#### TypeScript Issues

```bash
# Check TypeScript compilation
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Watch for type errors
npm run dev # Usually includes type checking
```

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  \"recommendations\": [
    \"ms-vscode.vscode-typescript-next\",
    \"esbenp.prettier-vscode\",
    \"bradlc.vscode-tailwindcss\",
    \"ms-vscode.vscode-json\",
    \"humao.rest-client\"
  ]
}
```

### VS Code Settings

```json
{
  \"editor.formatOnSave\": true,
  \"editor.codeActionsOnSave\": {
    \"source.fixAll\": true
  },
  \"typescript.preferences.importModuleSpecifier\": \"relative\"
}
```

### REST Client Testing

Create `.http` files for API testing:

```http
### Login
POST http://localhost:3000/api/login
Content-Type: application/json

{
  \"username\": \"juan\",
  \"password\": \"123456\"
}

### Get Profile
GET http://localhost:3000/api/profile

### Logout
POST http://localhost:3000/api/logout
```

## 📊 Performance Monitoring

### Development Metrics

Monitor these aspects during development:

1. **Response Times**
   - Login: < 100ms
   - Protected routes: < 50ms
   - Session lookup: < 10ms

2. **Memory Usage**
   - Backend process memory
   - Redis memory consumption
   - Frontend bundle size

3. **Network Performance**
   - Request payload sizes
   - Cookie overhead
   - Compression effectiveness

### Profiling Tools

```bash
# Node.js profiling
node --inspect backend/src/server.ts

# Memory usage
npm run dev -- --inspect

# Bundle analysis (frontend)
npm run build -- --analyze
```

## 🔄 Git Workflow

### Branch Strategy

```bash
# Feature development
git checkout -b feature/session-monitoring
git add .
git commit -m \"feat: add session monitoring dashboard\"
git push origin feature/session-monitoring

# Bug fixes
git checkout -b fix/session-expiration-handling
git commit -m \"fix: handle session expiration gracefully\"

# Documentation updates
git checkout -b docs/api-documentation
git commit -m \"docs: add comprehensive API documentation\"
```

### Commit Message Format

Follow conventional commits:

```bash
# Types: feat, fix, docs, style, refactor, test, chore

feat: add real-time session monitoring
fix: resolve cookie secure flag in development
docs: update installation instructions
style: format code with prettier
refactor: extract session utilities
test: add session expiration tests
chore: update dependencies
```

This development guide ensures consistent, maintainable code while providing effective debugging strategies for the session management application.