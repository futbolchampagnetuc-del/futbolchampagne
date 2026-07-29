"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin-auth") === "true";
    }
    return false;
  });
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-fade-in px-4">
        <div className="card-premium w-full max-w-sm p-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4af37]/10">
              <Lock className="h-6 w-6 text-[#d4af37]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-foreground mb-6">
            Acceso Administrador
          </h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (usuario === "admin" && clave === "123456") {
                setIsAuthenticated(true);
                localStorage.setItem("admin-auth", "true");
                setError(false);
              } else {
                setError(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Usuario
              </label>
              <input
                type="text"
                className="input-premium"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej: admin"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Contraseña
              </label>
              <input
                type="password"
                className="input-premium"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="******"
              />
            </div>
            
            {error && (
              <p className="text-destructive text-sm text-center">
                Credenciales incorrectas.
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-3 mt-2 text-sm font-bold">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
