export const TOKEN_KEY = "@token";
export const REFRESH_TOKEN_KEY = "@refresh-token";
export const USERNAME_KEY = "@username";

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUsername = () => {
  let user = localStorage.getItem(USERNAME_KEY);
  
  return user;
};

export const login = (username, data) => {
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
};

export const logout = () => {
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};