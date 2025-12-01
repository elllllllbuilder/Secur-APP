// src/App.tsx
import React, { useEffect } from "react";
import Login from "./pages/Login";
import DocumentsList from "./pages/DocumentsList";
import { loadTokenFromStorage } from "./auth";

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

  useEffect(() => {
    const t = loadTokenFromStorage();
    setToken(t);
    setReady(true);
  }, []);

  if (!ready) return null;

  return token ? <DocumentsList /> : <Login onLogged={(t) => setToken(t)} />;
}
