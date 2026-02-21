import { useState } from "react";
import api, { clearStoredAuth, getStoredAuth, setStoredAuth } from "../lib/api.js";
import AuthContext from "./authContext.js";

const extractAuthPayload = (payload) => ({
  user: payload.user,
  accessToken: payload.accessToken,
  refreshToken: payload.refreshToken
});

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth());

  const applyAuth = (nextAuth) => {
    setAuth(nextAuth);
    if (nextAuth) {
      setStoredAuth(nextAuth);
    } else {
      clearStoredAuth();
    }
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    const nextAuth = extractAuthPayload(data);
    applyAuth(nextAuth);
    return nextAuth;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const nextAuth = extractAuthPayload(data);
    applyAuth(nextAuth);
    return nextAuth;
  };

  const logout = async () => {
    try {
      if (auth?.refreshToken) {
        await api.post("/auth/logout", { refreshToken: auth.refreshToken });
      }
    } catch {
      // logout remains local if backend refresh token is already invalid
    } finally {
      applyAuth(null);
    }
  };

  const value = {
    user: auth?.user || null,
    accessToken: auth?.accessToken || null,
    refreshToken: auth?.refreshToken || null,
    isAuthenticated: Boolean(auth?.accessToken),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
