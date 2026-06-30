// Simple localStorage-based auth for MVP demo
// Replace with real API calls + NextAuth in production

const USERS_KEY = 'tekbiz_users';
const SESSION_KEY = 'tekbiz_session';

export function getUsers() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register({ name, email, phone, password, storeName, storeCategory }) {
  const users = getUsers();

  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Cet email est déjà utilisé' };
  }

  const slug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Check if slug already exists
  if (users.find(u => u.store?.slug === slug)) {
    return { success: false, error: 'Ce nom de boutique est déjà pris' };
  }

  const user = {
    id: 'user_' + Date.now(),
    name,
    email,
    phone,
    password, // In production, hash this server-side!
    store: {
      id: 'store_' + Date.now(),
      name: storeName,
      slug,
      category: storeCategory,
      description: '',
      phone,
      address: '',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  // Auto-login
  const session = { userId: user.id, name: user.name, email: user.email, store: user.store };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, user: session };
}

export function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: 'Email ou mot de passe incorrect' };
  }

  const session = { userId: user.id, name: user.name, email: user.email, store: user.store };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, user: session };
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
