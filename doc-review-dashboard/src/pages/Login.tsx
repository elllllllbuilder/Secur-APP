// src/pages/Login.tsx
import React, { useState } from "react";
import { login } from "@/auth";

export default function Login({ onLogged }: { onLogged: (t: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const t = await login(email, password);
      onLogged(t);
    } catch (e: any) {
      alert(e?.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="container card" style={{ maxWidth: 420 }}>
      <h2 style={{ marginBottom: 12 }}>Entrar</h2>
      <div style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}
