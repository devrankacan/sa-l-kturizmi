import Cookies from 'js-cookie';

export const getToken = () => Cookies.get('token');

export const setToken = (token) => Cookies.set('token', token, { expires: 7 });

export const removeToken = () => Cookies.remove('token');

export const isLoggedIn = () => !!getToken();

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
