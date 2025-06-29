/**
 * Session Demo Frontend Application
 * 
 * This TypeScript application demonstrates client-side session management:
 * - Automatic cookie handling with fetch credentials: 'include'
 * - Session state management and UI updates
 * - Real-time cookie monitoring
 * - Error handling and user feedback
 * 
 * Key concepts demonstrated:
 * - Browser automatically sends cookies with requests
 * - Frontend doesn't need to manually manage session tokens
 * - Session state determines UI visibility and functionality
 */

// Backend API configuration
const API_BASE = 'http://localhost:3000/api';

/**
 * TypeScript Interfaces for Type Safety
 * 
 * These interfaces ensure type safety when working with API responses
 * and provide better developer experience with autocomplete.
 */

/** User information structure */
interface User {
  id: string;
  username: string;
}

/** Login API response structure */
interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

/** Session status check response structure */
interface SessionStatus {
  authenticated: boolean;
  username: string | null;
  sessionId: string;
}

/**
 * DOM Element References
 * 
 * We cache DOM elements for better performance and type safety.
 * Using TypeScript's type assertions to ensure correct element types.
 */
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

// Interactive buttons for user actions
const getProfileBtn = document.getElementById('get-profile')!;
const getSecretBtn = document.getElementById('get-secret')!;
const logoutBtn = document.getElementById('logout')!;
const refreshCookiesBtn = document.getElementById('refresh-cookies')!;

/**
 * Cookie Display Utility
 * 
 * Reads browser cookies and displays them in the UI for educational purposes.
 * This helps users understand when session cookies are set/cleared.
 * 
 * Note: document.cookie only shows cookies accessible to JavaScript.
 * HttpOnly cookies (like our session cookie) won't appear here,
 * but can be seen in browser DevTools.
 */
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

/**
 * Enhanced Fetch Wrapper for Session-Based Requests
 * 
 * This wrapper ensures all API requests include session cookies:
 * - credentials: 'include' tells browser to send cookies cross-origin
 * - Automatically sets JSON content type
 * - Preserves any custom headers passed in options
 * 
 * Without credentials: 'include', the session cookie won't be sent
 * and all protected routes would return 401 Unauthorized.
 * 
 * @param url - API endpoint URL
 * @param options - Standard fetch RequestInit options
 * @returns Promise resolving to Response object
 */
async function fetchWithCredentials(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include', // CRITICAL: Enables cookie transmission
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Session Status Verification
 * 
 * Checks current authentication status with the server and updates UI accordingly.
 * This function demonstrates how the browser automatically includes the session
 * cookie in the request, allowing the server to identify the user.
 * 
 * Called on:
 * - Initial page load
 * - After successful login
 * - After logout
 * - When checking if session expired
 */
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

/**
 * UI State Management - Show Login Form
 * 
 * Displays login form and hides authenticated user content.
 * Called when user is not authenticated.
 */
function showLoginSection() {
  loginSection.style.display = 'block';
  userSection.style.display = 'none';
  responseArea.innerHTML = '';
}

/**
 * UI State Management - Show User Dashboard
 * 
 * Displays authenticated user content and hides login form.
 * Called when user is successfully authenticated.
 * 
 * @param username - Authenticated user's display name
 */
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

/**
 * Response Display Utility
 * 
 * Shows API responses in a formatted, color-coded display.
 * Helps users understand what data is being exchanged.
 * 
 * @param data - Response data to display
 * @param isError - Whether to style as error or success
 */
function displayResponse(data: any, isError: boolean = false) {
  responseArea.innerHTML = JSON.stringify(data, null, 2);
  responseArea.className = `response-box ${isError ? 'error' : 'success'}`;
}

/**
 * Login Form Submit Handler
 * 
 * Handles user authentication process:
 * 1. Prevents default form submission
 * 2. Validates input fields
 * 3. Sends credentials to backend
 * 4. Backend creates session and sets cookie
 * 5. Updates UI based on authentication result
 * 
 * The session cookie is automatically stored by the browser
 * and will be sent with all subsequent requests.
 */
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
    
    /**
     * Send login request with credentials
     * 
     * The fetchWithCredentials wrapper ensures the browser will:
     * - Send any existing cookies
     * - Accept and store new cookies from Set-Cookie headers
     * - Include credentials in future requests to same origin
     */
    const response = await fetchWithCredentials(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    const data: LoginResponse = await response.json();
    
    console.log('📨 Respuesta de login:', data);
    
    if (data.success) {
      console.log('✅ Login exitoso!');
      // Clear form for security
      usernameInput.value = '';
      passwordInput.value = '';
      
      // Refresh session status to update UI
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

/**
 * Get Profile Button Click Handler
 * 
 * Demonstrates accessing a protected route:
 * 1. Browser automatically includes session cookie
 * 2. Backend middleware verifies authentication
 * 3. If authenticated, returns user profile data
 * 4. If not authenticated, returns 401 error
 * 
 * This shows how session-based auth works transparently
 * once the session cookie is established.
 */
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

/**
 * Get Secret Data Button Click Handler
 * 
 * Another example of protected route access to demonstrate
 * that the same session authentication works across
 * different endpoints consistently.
 */
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

/**
 * Logout Button Click Handler
 * 
 * Handles session termination process:
 * 1. Sends logout request to backend
 * 2. Backend destroys session in Redis
 * 3. Backend tells browser to clear session cookie
 * 4. Updates UI to show logged-out state
 * 
 * After logout, the session cookie is removed and
 * subsequent requests will not be authenticated.
 */
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

/**
 * Refresh Cookies Button Click Handler
 * 
 * Manually triggers cookie display update for debugging purposes.
 * Normally cookies are updated automatically every 2 seconds.
 */
refreshCookiesBtn.addEventListener('click', () => {
  console.log('🔄 Actualizando display de cookies...');
  updateCookieDisplay();
});

/**
 * Application Initialization
 * 
 * Sets up the application on page load:
 * 1. Check current session status to determine initial UI state
 * 2. Update cookie display to show current browser cookies
 * 3. Set up automatic cookie refresh for real-time monitoring
 * 
 * The session check will automatically show login or user section
 * based on whether a valid session exists.
 */
console.log('🚀 Iniciando aplicación...');
checkSession(); // Determine initial authentication state
updateCookieDisplay(); // Show current cookies

// Update cookie display every 2 seconds for real-time monitoring
setInterval(updateCookieDisplay, 2000); 