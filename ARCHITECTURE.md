# 🏗️ System Architecture

This document provides a detailed overview of the session management demo application architecture, explaining how components interact and the data flow throughout the system.

## 🎯 Overview

The application follows a traditional client-server architecture with session-based authentication. The key architectural decision is to use Redis as an external session store, which provides scalability and persistence benefits over in-memory sessions.

## 🔧 Component Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │    Backend      │    │     Redis       │
│   (Vite + TS)   │◄──►│  (Express + TS) │◄──►│  (Session Store) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                         │                         │
       │                         │                         │
   Browser Cookie            Session Data              Persistent
   Management               Processing                 Storage
```

### Frontend Components

- **Vite Development Server**: Fast development with HMR
- **TypeScript Application**: Type-safe client-side logic
- **Fetch API**: HTTP client with credential support
- **DOM Manipulation**: Direct UI updates based on auth state

### Backend Components

- **Express.js Server**: HTTP request handling and routing
- **express-session Middleware**: Automatic session management
- **connect-redis Store**: Redis integration for session persistence
- **CORS Middleware**: Cross-origin request handling
- **Authentication Middleware**: Route protection logic

### Infrastructure Components

- **Redis Server**: Key-value store for session data
- **Docker Container**: Isolated Redis environment
- **Session Monitor**: Development tools for Redis inspection

## 🔄 Data Flow

### Authentication Flow

```
1. User Login Request
   ┌─────────────┐
   │   Browser   │
   └─────────────┘
          │ POST /api/login
          ▼
   ┌─────────────┐    ┌─────────────┐
   │   Express   │───►│  Validate   │
   │   Server    │    │Credentials  │
   └─────────────┘    └─────────────┘
          │                   │
          │ Session Created   │
          ▼                   ▼
   ┌─────────────┐    ┌─────────────┐
   │express-     │───►│    Redis    │
   │session      │    │   Store     │
   └─────────────┘    └─────────────┘
          │
          │ Set-Cookie Header
          ▼
   ┌─────────────┐
   │   Browser   │
   │   Stores    │
   │   Cookie    │
   └─────────────┘
```

### Protected Route Access

```
1. Authenticated Request
   ┌─────────────┐
   │   Browser   │ (Includes Cookie)
   └─────────────┘
          │ GET /api/profile
          ▼
   ┌─────────────┐    ┌─────────────┐
   │express-     │───►│    Redis    │
   │session      │    │   Lookup    │
   └─────────────┘    └─────────────┘
          │                   │
          │ Session Data      │
          ▼                   ▼
   ┌─────────────┐    ┌─────────────┐
   │requireAuth  │───►│  Protected  │
   │Middleware   │    │   Route     │
   └─────────────┘    └─────────────┘
          │
          │ Response
          ▼
   ┌─────────────┐
   │   Browser   │
   └─────────────┘
```

## 🔐 Security Architecture

### Session Security Layers

1. **Transport Security**: HTTPS in production
2. **Cookie Security**: HttpOnly, Secure, SameSite attributes
3. **Session Signing**: Cryptographic signature prevents tampering
4. **Session Storage**: External Redis store isolation
5. **CORS Configuration**: Controlled cross-origin access

### Authentication Middleware

```typescript
const requireAuth = (req, res, next) => {
  // 1. express-session automatically:
  //    - Reads session cookie
  //    - Validates signature
  //    - Retrieves session data from Redis
  //    - Populates req.session

  // 2. Custom validation:
  if (req.session.isAuthenticated) {
    next(); // Allow access
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

## 📊 Data Models

### Session Data Structure

```typescript
interface SessionData {
  // Core session properties
  cookie: {
    originalMaxAge: number;  // Session lifetime
    expires: Date;           // Expiration timestamp
    secure: boolean;         // HTTPS only flag
    httpOnly: boolean;       // JS access prevention
    path: string;           // Cookie path scope
  };
  
  // Application-specific data
  userId?: string;           // User identifier
  username?: string;         // Display name
  isAuthenticated?: boolean; // Auth status flag
}
```

### Redis Storage Format

```
Key: sess:{sessionId}
Value: JSON.stringify(sessionData)
TTL: 86400 seconds (24 hours)

Example:
Key: "sess:vCmLec24WRMXOD_Uo5hr7Au8LAb6RFKp"
Value: "{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2024-01-15T14:30:20.000Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"userId\":\"1\",\"username\":\"juan\",\"isAuthenticated\":true}"
TTL: 86345
```

## 🌐 Network Architecture

### Development Setup

```
Frontend (localhost:5173)
     │
     │ HTTP Requests
     │ (with credentials)
     ▼
Backend (localhost:3000)
     │
     │ Session Operations
     ▼
Redis (localhost:6379)
```

### CORS Configuration

```typescript
app.use(cors({
  origin: ['http://localhost:5173'],  // Frontend URL
  credentials: true,                  // Enable cookies
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
```

## 🔧 Session Lifecycle Management

### Creation Process

1. **User Authentication**: Credentials validated
2. **Session Initialization**: `req.session` properties set
3. **Session ID Generation**: Unique identifier created
4. **Redis Storage**: Session data stored with TTL
5. **Cookie Creation**: Signed cookie with session ID
6. **Response Delivery**: Set-Cookie header included

### Validation Process

1. **Cookie Reception**: Browser sends session cookie
2. **Signature Verification**: Cookie integrity checked
3. **Redis Lookup**: Session data retrieved by ID
4. **Session Population**: `req.session` object populated
5. **Authentication Check**: Middleware validates auth status
6. **Access Decision**: Allow or deny route access

### Expiration Process

1. **TTL Monitoring**: Redis automatically tracks expiration
2. **Automatic Cleanup**: Expired sessions removed from Redis
3. **Cookie Expiration**: Browser respects cookie max-age
4. **Session Invalidation**: Expired sessions fail validation

## 📈 Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: No session data in application memory
- **Shared Session Store**: Multiple backend instances share Redis
- **Load Balancer Friendly**: Any backend can handle any request
- **Session Persistence**: Sessions survive backend restarts

### Performance Optimizations

- **Redis Pipelining**: Batch operations for better performance
- **Connection Pooling**: Reuse Redis connections
- **Session Data Minimization**: Store only essential data
- **Efficient Serialization**: JSON format for data storage

## 🛡️ Security Considerations

### Threat Mitigation

| Threat | Mitigation | Implementation |
|--------|------------|----------------|
| Session Hijacking | Secure cookies | `secure: true` in production |
| XSS Attacks | HttpOnly cookies | `httpOnly: true` |
| CSRF Attacks | SameSite cookies | `sameSite: 'strict'` (configurable) |
| Session Fixation | Session regeneration | New ID on privilege change |
| Timing Attacks | Constant-time comparison | Built into express-session |

### Configuration Security

```typescript
// Production-ready session configuration
session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,     // Strong random secret
  resave: false,                          // Prevent unnecessary saves
  saveUninitialized: false,               // Don't create empty sessions
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true,                       // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000,         // 24 hour expiration
    sameSite: 'strict'                    // CSRF protection
  }
})
```

## 🔍 Monitoring and Debugging

### Session Monitoring Tools

The application includes custom Redis monitoring utilities:

- **Session Listing**: View all active sessions
- **Real-time Monitoring**: Watch Redis operations live
- **Statistics**: Session count and TTL metrics
- **Cleanup Tools**: Manual expired session removal

### Debugging Strategies

1. **Console Logging**: Detailed session lifecycle logs
2. **Browser DevTools**: Cookie and network inspection
3. **Redis CLI**: Direct session data examination
4. **Custom Monitors**: Application-specific monitoring tools

## 🚀 Deployment Architecture

### Production Considerations

```
Internet
    │
    ▼
Load Balancer (nginx/Apache)
    │
    ▼
Application Servers (Multiple Instances)
    │
    ▼
Redis Cluster (High Availability)
```

### Environment Configuration

- **Development**: Single Redis instance, HTTP allowed
- **Staging**: Redis with auth, HTTPS preferred
- **Production**: Redis cluster, HTTPS required, strict security

This architecture provides a solid foundation for understanding session-based authentication while maintaining security, scalability, and maintainability principles.