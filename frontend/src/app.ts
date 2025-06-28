// Configuración de la API
const API_BASE = 'http://localhost:3000/api';

// Tipos TypeScript
interface User {
  id: string;
  username: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface SessionStatus {
  authenticated: boolean;
  username: string | null;
  sessionId: string;
}

// Elementos del DOM
const loginSection = document.getElementById('login-section')!;
const userSection = document.getElementById('user-section')!;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const sessionInfo = document.getElementById('session-info')!;
const sessionStatus = document.getElementById('session-status')!;
const userInfo = document.getElementById('user-info')!;
const responseArea = document.getElementById('response-area')!;
const cookieInfo = document.getElementById('cookie-info')!;

// Botones
const getProfileBtn = document.getElementById('get-profile')!;
const getSecretBtn = document.getElementById('get-secret')!;
const logoutBtn = document.getElementById('logout')!;
const refreshCookiesBtn = document.getElementById('refresh-cookies')!;

// 🍪 Función para mostrar cookies
function updateCookieDisplay() {
  const cookies = document.cookie.split(';').filter(c => c.trim());
  
  if (cookies.length === 0) {
    cookieInfo.textContent = 'No hay cookies en este dominio';
    cookieInfo.className = 'info-box';
  } else {
    cookieInfo.innerHTML = cookies.map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return `<strong>${name}:</strong> ${value || '(vacío)'}`;
    }).join('\n');
    cookieInfo.className = 'info-box success';
  }
}

// 🔄 Función para realizar peticiones con cookies
async function fetchWithCredentials(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include', // ¡IMPORTANTE! Para enviar cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// 📊 Verificar estado de sesión
async function checkSession() {
  try {
    console.log('🔍 Verificando estado de sesión...');
    
    const response = await fetchWithCredentials(`${API_BASE}/check-session`);
    const data: SessionStatus = await response.json();
    
    console.log('📊 Estado de sesión:', data);
    
    if (data.authenticated) {
      showUserSection(data.username!);
      sessionInfo.innerHTML = `
        ✅ <strong>Autenticado</strong><br>
        👤 Usuario: ${data.username}<br>
        🆔 Session ID: ${data.sessionId}
      `;
      sessionStatus.className = 'status-box authenticated';
    } else {
      showLoginSection();
      sessionInfo.innerHTML = `
        ❌ <strong>No autenticado</strong><br>
        🆔 Session ID: ${data.sessionId}<br>
        💡 Necesitas hacer login
      `;
      sessionStatus.className = 'status-box not-authenticated';
    }
    
    updateCookieDisplay();
  } catch (error) {
    console.error('❌ Error verificando sesión:', error);
    sessionInfo.innerHTML = '❌ Error conectando con el servidor';
    sessionStatus.className = 'status-box error';
  }
}

// 🚪 Mostrar sección de login
function showLoginSection() {
  loginSection.style.display = 'block';
  userSection.style.display = 'none';
  responseArea.innerHTML = '';
}

// 👤 Mostrar sección de usuario
function showUserSection(username: string) {
  loginSection.style.display = 'none';
  userSection.style.display = 'block';
  userInfo.innerHTML = `
    <div class="success">
      👋 ¡Bienvenido, <strong>${username}</strong>!<br>
      🔐 Estás autenticado y puedes acceder a las funciones protegidas.
    </div>
  `;
}

// 📝 Función para mostrar respuestas
function displayResponse(data: any, isError: boolean = false) {
  responseArea.innerHTML = JSON.stringify(data, null, 2);
  responseArea.className = `response-box ${isError ? 'error' : 'success'}`;
}

// 🔐 Manejar login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!username || !password) {
    displayResponse({ error: 'Usuario y contraseña son requeridos' }, true);
    return;
  }
  
  try {
    console.log('🔐 Intentando login...', { username });
    
    const response = await fetchWithCredentials(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    const data: LoginResponse = await response.json();
    
    console.log('📨 Respuesta de login:', data);
    
    if (data.success) {
      console.log('✅ Login exitoso!');
      // Limpiar formulario
      usernameInput.value = '';
      passwordInput.value = '';
      
      // Verificar sesión actualizada
      await checkSession();
      
      displayResponse({
        message: '✅ Login exitoso!',
        user: data.user,
        note: '🍪 Se ha establecido una cookie de sesión'
      });
    } else {
      console.log('❌ Login fallido');
      displayResponse(data, true);
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    displayResponse({ error: 'Error conectando con el servidor' }, true);
  }
});

// 👤 Obtener perfil
getProfileBtn.addEventListener('click', async () => {
  try {
    console.log('👤 Obteniendo perfil...');
    
    const response = await fetchWithCredentials(`${API_BASE}/profile`);
    const data = await response.json();
    
    console.log('📨 Respuesta de perfil:', data);
    
    if (response.ok) {
      displayResponse({
        message: '✅ Perfil obtenido exitosamente',
        ...data,
        note: '🍪 La cookie de sesión fue enviada automáticamente'
      });
    } else {
      displayResponse(data, true);
      if (response.status === 401) {
        await checkSession(); // Verificar si la sesión expiró
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    displayResponse({ error: 'Error conectando con el servidor' }, true);
  }
});

// 🔒 Obtener datos secretos
getSecretBtn.addEventListener('click', async () => {
  try {
    console.log('🔒 Obteniendo datos secretos...');
    
    const response = await fetchWithCredentials(`${API_BASE}/secret-data`);
    const data = await response.json();
    
    console.log('📨 Respuesta de datos secretos:', data);
    
    if (response.ok) {
      displayResponse({
        message: '🔒 Datos secretos obtenidos',
        ...data,
        note: '🔐 Solo usuarios autenticados pueden ver esto'
      });
    } else {
      displayResponse(data, true);
      if (response.status === 401) {
        await checkSession();
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos secretos:', error);
    displayResponse({ error: 'Error conectando con el servidor' }, true);
  }
});

// 🚪 Logout
logoutBtn.addEventListener('click', async () => {
  try {
    console.log('🚪 Cerrando sesión...');
    
    const response = await fetchWithCredentials(`${API_BASE}/logout`, {
      method: 'POST',
    });
    
    const data = await response.json();
    
    console.log('📨 Respuesta de logout:', data);
    
    if (data.success) {
      console.log('✅ Logout exitoso!');
      await checkSession(); // Verificar estado actualizado
      displayResponse({
        message: '🚪 Sesión cerrada exitosamente',
        note: '🍪 La cookie de sesión ha sido eliminada'
      });
    } else {
      displayResponse(data, true);
    }
  } catch (error) {
    console.error('❌ Error en logout:', error);
    displayResponse({ error: 'Error conectando con el servidor' }, true);
  }
});

// 🔄 Actualizar cookies
refreshCookiesBtn.addEventListener('click', () => {
  console.log('🔄 Actualizando display de cookies...');
  updateCookieDisplay();
});

// 🚀 Inicializar aplicación
console.log('🚀 Iniciando aplicación...');
checkSession();
updateCookieDisplay();

// Actualizar cookies cada 2 segundos para ver cambios en tiempo real
setInterval(updateCookieDisplay, 2000); 