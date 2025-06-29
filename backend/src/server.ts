/**
 * Session Management Demo Backend Server
 * 
 * This server demonstrates comprehensive session-based authentication using:
 * - Express.js with TypeScript for the web framework
 * - Redis for session storage with connect-redis
 * - CORS for cross-origin resource sharing
 * - Detailed logging for educational purposes
 * 
 * Key concepts demonstrated:
 * - Automatic session creation via express-session
 * - Cookie management (creation, sending, deletion)
 * - Session-based authentication middleware
 * - Redis session persistence
 * - Secure session configuration
 */

import express from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import cors from 'cors';

const app = express();
const PORT = 3000;

/**
 * Enhanced logging utility for educational session debugging
 * 
 * Provides colorful, timestamped logs with emoji prefixes to make
 * the session flow clearly visible in the console output.
 * 
 * @param emoji - Visual indicator for the type of operation
 * @param message - Human-readable description of what's happening
 * @param data - Optional structured data to display in JSON format
 */
const logWithEmoji = (emoji: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${emoji} [${timestamp}] ${message}`);
  if (data) {
    console.log('   📋 Detalles:', JSON.stringify(data, null, 2));
  }
  console.log(''); // Línea en blanco para separar
};

/**
 * Redis client configuration for session storage
 * 
 * Redis stores session data separately from the application memory,
 * providing persistence and scalability benefits:
 * - Sessions survive server restarts
 * - Multiple server instances can share sessions
 * - Automatic session expiration via Redis TTL
 */
const redisClient = createClient();
redisClient.connect()
  .then(() => logWithEmoji('📡', 'Conectado a Redis'))
  .catch((err: any) => logWithEmoji('❌', 'Error conectando a Redis', { error: err.message }));

/**
 * CORS (Cross-Origin Resource Sharing) configuration
 * 
 * Critical for session-based authentication across different origins:
 * - credentials: true - Allows cookies to be sent cross-origin
 * - origin: Whitelist of allowed frontend URLs
 * - methods: HTTP methods the frontend can use
 * - allowedHeaders: Headers the frontend can send
 * 
 * Without credentials: true, session cookies won't be sent!
 */
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true, // Essential for cookie-based sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Handle preflight OPTIONS requests for all routes
 * 
 * Browser sends OPTIONS request before actual request to check CORS policy.
 * This ensures all routes accept cross-origin requests with credentials.
 */
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

/**
 * Express Session Middleware Configuration
 * 
 * This is the core of session management. express-session automatically:
 * 1. Creates unique session IDs for each client
 * 2. Stores session data in Redis via RedisStore
 * 3. Sets/sends session cookies with proper security flags
 * 4. Retrieves session data on subsequent requests
 * 5. Handles session expiration and cleanup
 */
logWithEmoji('🔧', 'Configurando middleware de sesiones...', {
  secret: 'mi-super-secreto-para-firmar-cookies',
  store: 'Redis',
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: '24 horas'
  }
});

app.use(session({
  store: new RedisStore({ client: redisClient }), // Persist sessions in Redis
  secret: process.env.SESSION_SECRET || 'mi-super-secreto-para-firmar-cookies', // Signs session ID cookies
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: process.env.NODE_ENV === 'prd', // HTTPS only in production
    httpOnly: true, // Prevent XSS - cookie not accessible via JavaScript
    maxAge: 24 * 60 * 60 * 1000 // 24 hours session lifetime
  }
}));

/**
 * TypeScript Session Data Interface Extension
 * 
 * Extends express-session's SessionData to include our custom fields.
 * This provides type safety when accessing session properties.
 */
declare module 'express-session' {
  interface SessionData {
    userId?: string;          // User's unique identifier
    username?: string;        // User's display name
    isAuthenticated?: boolean; // Authentication status flag
  }
}

/**
 * Mock User Database
 * 
 * In production, this would be replaced with actual database queries.
 * For demo purposes, we use hardcoded users to focus on session mechanics.
 * 
 * Security Note: Passwords should be hashed with bcrypt or similar in production.
 */
const users = [
  { id: '1', username: 'juan', password: '123456' },
  { id: '2', username: 'maria', password: 'password' },
  { id: '3', username: 'admin', password: 'admin123' }
];

logWithEmoji('👥', 'Usuarios de prueba cargados:', users.map(u => ({ username: u.username, password: '***' })));

/**
 * Authentication Middleware
 * 
 * This middleware protects routes by checking session authentication status.
 * It demonstrates how express-session automatically:
 * - Reads the session cookie from the request
 * - Retrieves session data from Redis using the session ID
 * - Populates req.session with the stored data
 * - Provides req.sessionID for debugging
 * 
 * @param req - Express request object with session data attached
 * @param res - Express response object
 * @param next - Express next function to continue middleware chain
 */
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  logWithEmoji('🔍', '🔐 MIDDLEWARE DE AUTENTICACIÓN - Verificando sesión...', {
    sessionID: req.sessionID,
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.username,
    note: '💡 req.sessionID viene automáticamente de express-session'
  });

  if (req.session.isAuthenticated) {
    logWithEmoji('✅', '🎉 ¡Usuario autenticado! Pasando al siguiente middleware...');
    next(); // Continue to protected route
  } else {
    logWithEmoji('❌', '🚫 Usuario NO autenticado. Acceso denegado.');
    res.status(401).json({ 
      error: 'No autorizado. Debes hacer login primero.',
      authenticated: false 
    });
  }
};

/**
 * API ROUTES
 * 
 * The following routes demonstrate the complete session lifecycle:
 * - Login: Creates session and sets cookie
 * - Protected routes: Verify session via middleware
 * - Session check: Non-destructive session verification
 * - Logout: Destroys session and clears cookie
 */

/**
 * POST /api/login - User Authentication Endpoint
 * 
 * This route demonstrates the session creation process:
 * 1. Validates user credentials against mock database
 * 2. If valid, modifies req.session properties
 * 3. express-session automatically detects session changes
 * 4. Generates session ID and stores data in Redis
 * 5. Sets session cookie in response headers
 * 6. Client receives cookie and stores it automatically
 * 
 * @route POST /api/login
 * @param {string} username - User's login name
 * @param {string} password - User's password (plain text for demo)
 * @returns {object} Success/failure response with user data
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  logWithEmoji('🔐', '🚪 INTENTO DE LOGIN - Recibiendo credenciales...', { username, password: '***' });
  
  // Authenticate user against mock database
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    logWithEmoji('✅', '🎉 ¡Usuario encontrado! Creando sesión...');
    
    /**
     * Session Creation - The Magic Happens Here!
     * 
     * When we modify req.session properties, express-session:
     * 1. Detects the changes to session data
     * 2. Generates a unique session ID (if not exists)
     * 3. Stores the session data in Redis with the session ID as key
     * 4. Creates a signed cookie containing the session ID
     * 5. Adds Set-Cookie header to the response
     * 
     * The client will automatically store this cookie and send it
     * with every subsequent request to this domain.
     */
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAuthenticated = true;
    
    logWithEmoji('🍪', '🍪 SESIÓN CREADA - Datos guardados en req.session:', {
      sessionID: req.sessionID,
      userId: user.id,
      username: user.username,
      isAuthenticated: true,
      note: '💡 express-session detectará estos cambios y creará la cookie automáticamente'
    });
    
    logWithEmoji('📤', '📤 ENVIANDO RESPUESTA - La cookie se incluirá automáticamente en Set-Cookie header');
    
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      user: { id: user.id, username: user.username }
    });
  } else {
    logWithEmoji('❌', '🚫 Login fallido - Usuario o contraseña incorrectos', { username });
    res.status(401).json({ 
      success: false, 
      message: 'Usuario o contraseña incorrectos' 
    });
  }
});

/**
 * GET /api/profile - Protected User Profile Endpoint
 * 
 * This route demonstrates protected resource access:
 * 1. requireAuth middleware runs first
 * 2. Middleware checks req.session.isAuthenticated
 * 3. If authenticated, continues to route handler
 * 4. Returns user profile data from session
 * 
 * Note: express-session automatically populated req.session
 * by reading the session cookie and fetching data from Redis
 * 
 * @route GET /api/profile
 * @middleware requireAuth - Ensures user is authenticated
 * @returns {object} User profile and session information
 */
app.get('/api/profile', requireAuth, (req, res) => {
  logWithEmoji('👤', '👤 SOLICITANDO PERFIL - Usuario autenticado accediendo a datos protegidos...', {
    username: req.session.username,
    sessionID: req.sessionID,
    note: '🔐 Esta ruta solo es accesible porque pasó el middleware requireAuth'
  });
  
  res.json({
    success: true,
    user: {
      id: req.session.userId,
      username: req.session.username,
      loginTime: new Date().toISOString()
    },
    session: {
      id: req.sessionID,
      authenticated: req.session.isAuthenticated
    }
  });
});

/**
 * GET /api/secret-data - Protected Secret Data Endpoint
 * 
 * Another example of a protected route to demonstrate that
 * the same session authentication works across multiple endpoints.
 * 
 * @route GET /api/secret-data
 * @middleware requireAuth - Ensures user is authenticated
 * @returns {object} Secret data for authenticated users only
 */
app.get('/api/secret-data', requireAuth, (req, res) => {
  logWithEmoji('🔒', '🔒 DATOS SECRETOS - Acceso a información confidencial...', {
    username: req.session.username,
    sessionID: req.sessionID,
    note: '🔐 Solo usuarios autenticados pueden ver esto'
  });
  
  res.json({
    success: true,
    secretData: `¡Datos súper secretos para ${req.session.username}!`,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/check-session - Session Status Check Endpoint
 * 
 * This route allows clients to check authentication status
 * without requiring authentication. Useful for:
 * - Initial app load to determine UI state
 * - Checking if session expired
 * - Debugging session issues
 * 
 * Note: This route deliberately doesn't use requireAuth middleware
 * so it can report unauthenticated status without rejecting the request.
 * 
 * @route GET /api/check-session
 * @returns {object} Current session status and basic info
 */
app.get('/api/check-session', (req, res) => {
  logWithEmoji('🔍', '🔍 VERIFICANDO ESTADO DE SESIÓN - Cliente consultando su estado...', {
    sessionID: req.sessionID,
    authenticated: req.session.isAuthenticated,
    username: req.session.username,
    note: '💡 Esta ruta no requiere autenticación, solo verifica el estado actual'
  });

  res.json({
    authenticated: !!req.session.isAuthenticated,
    username: req.session.username || null,
    sessionId: req.sessionID
  });
});

/**
 * POST /api/logout - User Logout Endpoint
 * 
 * This route demonstrates the session destruction process:
 * 1. Calls req.session.destroy() to remove session from Redis
 * 2. Calls res.clearCookie() to remove cookie from client
 * 3. Client will no longer send session cookie
 * 4. Subsequent requests will not have session data
 * 
 * Two-step cleanup ensures both server and client are clean.
 * 
 * @route POST /api/logout
 * @returns {object} Success/failure response for logout operation
 */
app.post('/api/logout', (req, res) => {
  const username = req.session.username;
  
  logWithEmoji('🚪', '🚪 LOGOUT - Usuario cerrando sesión...', {
    username,
    sessionID: req.sessionID,
    note: '🗑️ Se destruirá la sesión y se limpiará la cookie'
  });
  
  /**
   * Session Destruction Process
   * 
   * req.session.destroy() removes the session data from Redis.
   * res.clearCookie() tells the browser to delete the session cookie.
   * 
   * Both steps are necessary for complete logout:
   * - destroy() cleans up server-side data
   * - clearCookie() cleans up client-side cookie
   */
  req.session.destroy((err) => {
    if (err) {
      logWithEmoji('❌', '❌ ERROR - No se pudo destruir la sesión', { error: err.message });
      res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    } else {
      logWithEmoji('✅', '✅ SESIÓN DESTRUIDA - Limpiando cookie del navegador...', {
        username,
        note: '🧹 res.clearCookie("connect.sid") elimina la cookie del navegador'
      });
      res.clearCookie('connect.sid'); // Tell browser to delete the session cookie
      res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    }
  });
});

/**
 * Server Startup
 * 
 * Starts the Express server and displays helpful information
 * about the session management demonstration.
 */
app.listen(PORT, () => {
  logWithEmoji('🚀', '🚀 SERVIDOR INICIADO - ¡Todo listo para recibir requests!', {
    port: PORT,
    backend: `http://localhost:${PORT}`,
    frontend: 'http://localhost:5173',
    checkSession: `http://localhost:${PORT}/api/check-session`
  });
  
  console.log('🎯 PUNTOS CLAVE A OBSERVAR:');
  console.log('   1. 🍪 Las cookies se crean automáticamente al modificar req.session');
  console.log('   2. 🔍 req.sessionID viene automáticamente de express-session');
  console.log('   3. 🔐 El middleware requireAuth protege las rutas');
  console.log('   4. 📤 Las cookies se envían automáticamente en Set-Cookie header');
  console.log('   5. 🗑️ res.clearCookie() limpia la cookie del navegador');
  console.log('');
}); 