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

### 3. Levantar Redis con Docker

```bash
docker compose up -d redis
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

## 🔍 **Monitor de Sesiones Redis**

Este proyecto incluye un monitor avanzado de Redis para observar las sesiones en tiempo real. Es una herramienta muy útil para debugging y entender cómo funcionan las sesiones.

### 📋 **Características del Monitor**

- **📊 Visualización de sesiones**: Muestra todas las sesiones activas con sus datos
- **⏰ TTL en tiempo real**: Ve cuánto tiempo le queda a cada sesión
- **👁️ Monitoreo en tiempo real**: Observa operaciones de Redis en vivo
- **🧹 Limpieza automática**: Elimina sesiones expiradas
- **📈 Estadísticas**: Muestra métricas de uso de sesiones
- **🎨 Interfaz colorida**: Salida con colores para mejor legibilidad

### 🚀 **Cómo Usar el Monitor**

#### **1. Ver todas las sesiones activas**
```bash
cd backend
npm run monitor:list
```

**Salida ejemplo:**
```
🔍 Monitor de Sesiones Redis iniciado...

📊 2 sesiones activas:

🔑 sess:vCmLec24WRMXOD_Uo5hr7Au8LAb6RFKp
⏰ TTL: 86345s
📄 Datos:
{
  "cookie": {
    "originalMaxAge": 86400000,
    "expires": "2024-01-15T14:30:20.000Z",
    "secure": false,
    "httpOnly": true,
    "path": "/"
  },
  "userId": "1",
  "username": "juan",
  "isAuthenticated": true
}
──────────────────────────────────────────────────
```

#### **2. Monitorear operaciones en tiempo real**
```bash
npm run monitor:monitor
```

**Salida ejemplo:**
```
👁️  Monitoreando operaciones en tiempo real...

🔄 14:30:20: 1234567890.123456 [0 127.0.0.1:6379] "SET" "sess:vCmLec24WRMXOD_Uo5hr7Au8LAb6RFKp" "..."
🔄 14:30:25: 1234567890.123457 [0 127.0.0.1:6379] "GET" "sess:vCmLec24WRMXOD_Uo5hr7Au8LAb6RFKp"
🔄 14:30:30: 1234567890.123458 [0 127.0.0.1:6379] "DEL" "sess:vCmLec24WRMXOD_Uo5hr7Au8LAb6RFKp"
```

#### **3. Ver estadísticas de sesiones**
```bash
npm run monitor:stats
```

**Salida ejemplo:**
```
📈 Estadísticas de Sesiones:
   Total: 3
   Activas: 2
   Expiradas: 1
   TTL Promedio: 43200s
```

#### **4. Limpiar sesiones expiradas**
```bash
npm run monitor:clean
```

**Salida ejemplo:**
```
🧹 Limpiadas 1 sesiones expiradas
```

#### **5. Monitoreo continuo (cada 5 segundos)**
```bash
npm run monitor:watch
```

**Salida ejemplo:**
```
👀 Monitoreando sesiones cada 5 segundos...

📊 2 sesiones activas:
🔑 sess:abc123...
⏰ TTL: 86340s
...

[5 segundos después...]

📊 1 sesiones activas:
🔑 sess:abc123...
⏰ TTL: 86335s
...
```

### 🛠️ **Comandos Disponibles**

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `npm run monitor` | Muestra ayuda y comandos disponibles | `npm run monitor` |
| `npm run monitor:list` | Lista todas las sesiones activas | `npm run monitor:list` |
| `npm run monitor:monitor` | Monitorea operaciones en tiempo real | `npm run monitor:monitor` |
| `npm run monitor:stats` | Muestra estadísticas de sesiones | `npm run monitor:stats` |
| `npm run monitor:clean` | Limpia sesiones expiradas | `npm run monitor:clean` |
| `npm run monitor:watch` | Monitoreo continuo cada 5 segundos | `npm run monitor:watch` |

### 🔧 **Uso Directo del Script**

También puedes usar el script directamente:

```bash
cd backend

# Ver todas las sesiones
node redis-monitor.js list

# Monitorear en tiempo real
node redis-monitor.js monitor

# Ver estadísticas
node redis-monitor.js stats

# Limpiar sesiones expiradas
node redis-monitor.js clean

# Monitoreo continuo
node redis-monitor.js watch
```

### 📊 **Qué Información Muestra**

#### **Datos de Sesión**
- **Session ID**: Identificador único de la sesión
- **TTL**: Tiempo de vida restante en segundos
- **Datos de usuario**: ID, username, estado de autenticación
- **Configuración de cookie**: Expiración, seguridad, etc.

#### **Estadísticas**
- **Total de sesiones**: Número total de sesiones en Redis
- **Sesiones activas**: Sesiones con TTL > 0
- **Sesiones expiradas**: Sesiones con TTL <= 0
- **TTL promedio**: Tiempo de vida promedio de las sesiones activas

### 🎯 **Casos de Uso**

#### **Debugging de Sesiones**
```bash
# Ver qué sesiones están activas
npm run monitor:list

# Monitorear cuando un usuario hace login/logout
npm run monitor:monitor
```

#### **Mantenimiento**
```bash
# Limpiar sesiones expiradas
npm run monitor:clean

# Ver estadísticas de uso
npm run monitor:stats
```

#### **Desarrollo**
```bash
# Monitoreo continuo durante desarrollo
npm run monitor:watch
```

### ⚠️ **Notas Importantes**

1. **Redis debe estar ejecutándose**: Asegúrate de que Redis esté corriendo con `docker compose up -d redis`
2. **Conexión local**: El monitor se conecta a Redis en `localhost:6379`
3. **Solo sesiones**: El monitor filtra solo las claves que empiezan con `sess:`
4. **Permisos**: Asegúrate de que el script tenga permisos de ejecución

### 🔍 **Troubleshooting**

#### **Error de conexión a Redis**
```
❌ Error de Redis: connect ECONNREFUSED 127.0.0.1:6379
```
**Solución**: Ejecuta `docker compose up -d redis`

#### **No se muestran sesiones**
```
📭 No hay sesiones activas
```
**Solución**: 
1. Asegúrate de que el backend esté corriendo
2. Haz login en la aplicación
3. Verifica que Redis esté funcionando

#### **Error de módulos ES**
```
SyntaxError: Cannot use import statement outside a module
```
**Solución**: El package.json ya tiene `"type": "module"` configurado

### 🎨 **Personalización**

Puedes modificar el script `backend/redis-monitor.js` para:

- **Cambiar el intervalo** de monitoreo en `watch` (actualmente 5 segundos)
- **Agregar más filtros** para otras claves de Redis
- **Modificar el formato** de salida
- **Agregar más estadísticas** como uso de memoria, etc.

¡El monitor de Redis te ayudará a entender perfectamente cómo funcionan las sesiones en tu aplicación! 🚀 