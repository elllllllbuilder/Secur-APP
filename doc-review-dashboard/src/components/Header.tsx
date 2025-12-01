// src/components/Header.tsx
import React from "react";
import { logout as signOut } from "../auth";

type Props = { onLogout?: () => void };

export default function Header({ onLogout }: Props) {
  function handleLogout() {
    signOut();
    onLogout?.();
  }
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
      <h1 className="text-lg font-semibold">Dashboard de Documentos</h1>
      <button onClick={handleLogout} className="rounded-md px-3 py-1.5 bg-slate-700 hover:bg-slate-600">
        Sair
      </button>
    </header>
  );
}
