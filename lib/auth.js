// Client-side authentication helpers calling Next.js API routes

const SESSION_KEY = 'tekbiz_session';

export async function register({ name, email, phone, password, storeName, storeCategory }) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, storeName, storeCategory }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
    }
    return result.success ? result : { success: false, error: result.error || 'Erreur lors de l\'inscription' };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'Une erreur de connexion au serveur est survenue.' };
  }
}

export async function login(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
    }
    return result.success ? result : { success: false, error: result.error || 'Email ou mot de passe incorrect' };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Une erreur de connexion au serveur est survenue.' };
  }
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}
