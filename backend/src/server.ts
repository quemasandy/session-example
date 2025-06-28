import express from 'express';
import session from 'express-session';
import cors from 'cors';

const app = express();
const PORT = 3000;

// 🎨 Función para logs divertidos
const logWithEmoji = (emoji: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${emoji} [${timestamp}] ${message}`);
  if (data) {
    console.log('   📋 Detalles:', JSON.stringify(data, null, 2));
  }
  console.log(''); // Línea en blanco para separar
};

// Configuración de middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manejar preflight OPTIONS para todas las rutas
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// 🔑 Configuración de sesiones
logWithEmoji('🔧', 'Configurando middleware de sesiones...', {
  secret: 'mi-super-secreto-para-firmar-cookies',
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: '24 horas'
  }
});

app.use(session({
  secret: 'mi-super-secreto-para-firmar-cookies', // En producción usar variable de entorno
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true solo en HTTPS
    httpOnly: true, // La cookie no es accesible desde JavaScript del cliente
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Extender el tipo Session para TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    isAuthenticated?: boolean;
  }
}

// 📊 Usuarios simulados (en producción estarían en base de datos)
const users = [
  { id: '1', username: 'juan', password: '123456' },
  { id: '2', username: 'maria', password: 'password' },
  { id: '3', username: 'admin', password: 'admin123' }
];

logWithEmoji('👥', 'Usuarios de prueba cargados:', users.map(u => ({ username: u.username, password: '***' })));

// 🔐 Middleware para verificar autenticación
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  logWithEmoji('🔍', '🔐 MIDDLEWARE DE AUTENTICACIÓN - Verificando sesión...', {
    sessionID: req.sessionID,
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.username,
    note: '💡 req.sessionID viene automáticamente de express-session'
  });

  if (req.session.isAuthenticated) {
    logWithEmoji('✅', '🎉 ¡Usuario autenticado! Pasando al siguiente middleware...');
    next();
  } else {
    logWithEmoji('❌', '🚫 Usuario NO autenticado. Acceso denegado.');
    res.status(401).json({ 
      error: 'No autorizado. Debes hacer login primero.',
      authenticated: false 
    });
  }
};

// 🚪 RUTAS

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  logWithEmoji('🔐', '🚪 INTENTO DE LOGIN - Recibiendo credenciales...', { username, password: '***' });
  
  // Buscar usuario
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    logWithEmoji('✅', '🎉 ¡Usuario encontrado! Creando sesión...');
    
    // ✅ Crear sesión
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

// Obtener perfil (requiere autenticación)
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

// Datos protegidos (requiere autenticación)
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

// Verificar estado de sesión
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

// Logout
app.post('/api/logout', (req, res) => {
  const username = req.session.username;
  
  logWithEmoji('🚪', '🚪 LOGOUT - Usuario cerrando sesión...', {
    username,
    sessionID: req.sessionID,
    note: '🗑️ Se destruirá la sesión y se limpiará la cookie'
  });
  
  req.session.destroy((err) => {
    if (err) {
      logWithEmoji('❌', '❌ ERROR - No se pudo destruir la sesión', { error: err.message });
      res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    } else {
      logWithEmoji('✅', '✅ SESIÓN DESTRUIDA - Limpiando cookie del navegador...', {
        username,
        note: '🧹 res.clearCookie("connect.sid") elimina la cookie del navegador'
      });
      res.clearCookie('connect.sid'); // Limpiar cookie del navegador
      res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    }
  });
});

// Iniciar servidor
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