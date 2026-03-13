import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "../utils/authStorage";
import { apiClient } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Bootstrap auth state from existing token, if any.
    const token = getAccessToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    apiClient
      .get("/users/me/")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        setInitializing(false);
      });
  }, []);

  const signIn = async ({ email, password }) => {
    const response = await apiClient.post("/auth/token/", { email, password });
    const { access, user: userPayload } = response.data;
    if (access) {
      setAccessToken(access);
    }
    setUser(userPayload ?? null);
    return response.data;
  };

  const signUp = async (data) => {
    await apiClient.post("/users/register/", data);
    return signIn({ email: data.email, password: data.password });
  };

  const signOut = () => {
    clearAccessToken();
    setUser(null);
  };

  const setSession = ({ accessToken, user: userPayload }) => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUser(userPayload ?? null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      signIn,
      signUp,
      signOut,
      setSession
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

