# 🔐 Demo: Sesiones y Cookies con TypeScript

Este ejemplo te mostrará exactamente cómo funcionan las sesiones y cookies en una aplicación real con TypeScript, **incluyendo todos los detalles implícitos** que normalmente no se explican.

## 📁 Estructura del Proyecto

```
session-example/
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── src/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Configuración Inicial

### 1. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 2. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Cómo Ejecutar

### 1. Ejecutar el Backend

```bash
cd backend
npm run dev
```

El servidor se ejecutará en: http://localhost:3000

### 2. Ejecutar el Frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

El frontend se ejecutará en: http://localhost:5173

## 🧪 Cómo Probar

1. **Abre las herramientas de desarrollador (F12)**
2. **Ve a la pestaña Network** para ver las peticiones HTTP
3. **Ve a la pestaña Application/Storage** para ver las cookies
4. **Usa estos usuarios de prueba:**

| Usuario | Contraseña |
|---------|------------|
| juan    | 123456     |
| maria   | password   |
| admin   | admin123   |

## 🔍 Qué Observar

### En el Navegador:
- **Cookie automática**: Se crea después del login
- **Requests automáticos**: La cookie se envía en cada petición
- **Estados de la UI**: Cambia según la autenticación

### En la Consola del Backend:
- **Creación de sesión**: Al hacer login
- **Verificación automática**: En cada request protegido
- **Destrucción de sesión**: Al hacer logout

### En las DevTools:
- **Network**: Ve las cookies en los headers
- **Application**: Ve las cookies almacenadas
- **Console**: Ve los logs detallados

## 🎯 Puntos Clave del Ejemplo

- ✅ La cookie se crea automáticamente cuando haces login exitoso
- ✅ Se envía automáticamente en cada request al mismo dominio
- ✅ El servidor la verifica antes de permitir acceso a rutas protegidas
- ✅ Se destruye cuando haces logout o expira

## 🔧 Características Técnicas

### Backend (Node.js + Express + TypeScript)
- **Express Session**: Manejo de sesiones del lado del servidor
- **CORS**: Configurado para permitir cookies cross-origin
- **TypeScript**: Tipado completo para mejor desarrollo
- **Middleware de Autenticación**: Protección de rutas

### Frontend (HTML + CSS + TypeScript + Vite)
- **TypeScript**: Tipado completo del lado del cliente
- **Vite**: Servidor de desarrollo rápido
- **Fetch API**: Con `credentials: 'include'` para cookies
- **UI Responsive**: Diseño moderno y funcional

## 🍪 Configuración de Cookies

```typescript
app.use(session({
  secret: 'mi-super-secreto-para-firmar-cookies',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true solo en HTTPS
    httpOnly: true, // No accesible desde JavaScript
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
```

## 🔐 Rutas de la API

- `POST /api/login` - Iniciar sesión
- `GET /api/profile` - Obtener perfil (requiere auth)
- `GET /api/secret-data` - Datos protegidos (requiere auth)
- `GET /api/check-session` - Verificar estado de sesión
- `POST /api/logout` - Cerrar sesión

## 🔍 **DETALLES IMPLÍCITOS EXPLICADOS**

### 🍪 **¿Dónde se crea la cookie?**

**¡Automáticamente!** Cuando modificas `req.session`:

```typescript
// Al hacer esto:
req.session.userId = user.id;
req.session.username = user.username;
req.session.isAuthenticated = true;

// express-session automáticamente:
// 1. Detecta que req.session fue modificado
// 2. Genera una cookie con el sessionID
// 3. La incluye en la respuesta (Set-Cookie header)
// 4. ¡No necesitas hacer nada más!
```

### 🔍 **¿De dónde viene `req.sessionID`?**

**¡Automáticamente de express-session!** No lo creas tú:

```typescript
// express-session automáticamente:
// 1. Intercepta cada request
// 2. Lee la cookie 'connect.sid' del navegador
// 3. Genera o recupera el sessionID
// 4. Agrega req.sessionID al objeto request
// 5. Agrega req.session con los datos

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('SessionID:', req.sessionID); // ← Viene automáticamente
  // ...
};
```

### 📤 **¿Cómo se envía la cookie al navegador?**

**¡Automáticamente en el header Set-Cookie!** Cuando envías la respuesta:

```typescript
res.json({ success: true, message: 'Login exitoso' });

// express-session automáticamente agrega este header:
// Set-Cookie: connect.sid=s%3Aabc123def456.xyz789; Path=/; HttpOnly; Max-Age=86400
```

### 🔄 **¿Cómo se envía la cookie en cada request?**

**¡Automáticamente por el navegador!** Con `credentials: 'include'`:

```typescript
// En el frontend:
fetch(url, {
  credentials: 'include', // ← ¡IMPORTANTE! Para enviar cookies
  headers: { 'Content-Type': 'application/json' }
});

// El navegador automáticamente incluye:
// Cookie: connect.sid=s%3Aabc123def456.xyz789
```

### 🗑️ **¿Cómo se elimina la cookie?**

**¡Explícitamente con `res.clearCookie()`!** En el logout:

```typescript
req.session.destroy((err) => {
  if (!err) {
    res.clearCookie('connect.sid'); // ← Elimina la cookie del navegador
    res.json({ success: true, message: 'Sesión cerrada' });
  }
});
```

## 🎨 **LOGS DIVERTIDOS Y EXPLICATIVOS**

El servidor incluye logs detallados que explican cada paso:

```
🔧 [14:30:15] Configurando middleware de sesiones...
   📋 Detalles: {
     "secret": "mi-super-secreto-para-firmar-cookies",
     "cookie": {
       "secure": false,
       "httpOnly": true,
       "maxAge": "24 horas"
     }
   }

🔐 [14:30:20] 🚪 INTENTO DE LOGIN - Recibiendo credenciales...
   📋 Detalles: {
     "username": "juan",
     "password": "***"
   }

🍪 [14:30:20] 🍪 SESIÓN CREADA - Datos guardados en req.session:
   📋 Detalles: {
     "sessionID": "abc123def456",
     "userId": "1",
     "username": "juan",
     "isAuthenticated": true,
     "note": "💡 express-session detectará estos cambios y creará la cookie automáticamente"
   }

📤 [14:30:20] 📤 ENVIANDO RESPUESTA - La cookie se incluirá automáticamente en Set-Cookie header
```

## 🚨 Notas Importantes

1. **En producción**: Cambia el `secret` por una variable de entorno
2. **HTTPS**: En producción, configura `secure: true` para las cookies
3. **Base de datos**: Los usuarios están hardcodeados, en producción usa una BD real
4. **Seguridad**: Este es un ejemplo educativo, implementa medidas de seguridad adicionales en producción

## 🎯 **PUNTOS CLAVE A OBSERVAR**

1. 🍪 **Las cookies se crean automáticamente** al modificar `req.session`
2. 🔍 **`req.sessionID` viene automáticamente** de express-session
3. 🔐 **El middleware `requireAuth` protege las rutas**
4. 📤 **Las cookies se envían automáticamente** en Set-Cookie header
5. 🗑️ **`res.clearCookie()` limpia la cookie** del navegador

## 🔍 **FLUJO COMPLETO DE UNA SESIÓN**

### 1. **Login Exitoso**
```
Cliente → POST /api/login → Servidor
Servidor → Modifica req.session → express-session detecta cambios
express-session → Genera cookie → Incluye en Set-Cookie header
Servidor → Responde con cookie → Cliente almacena cookie
```

### 2. **Request Autenticado**
```
Cliente → Incluye cookie automáticamente → GET /api/profile
Servidor → express-session lee cookie → Recupera sesión
Servidor → req.sessionID disponible → Verifica autenticación
Servidor → Responde con datos protegidos
```

### 3. **Logout**
```
Cliente → POST /api/logout → Servidor
Servidor → req.session.destroy() → Destruye sesión
Servidor → res.clearCookie() → Elimina cookie del navegador
Servidor → Responde confirmación → Cliente ya no tiene cookie
```

¡Este ejemplo te mostrará exactamente cómo funcionan las sesiones y cookies en la práctica, **incluyendo todos los detalles que normalmente están ocultos**! 🚀 