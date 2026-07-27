"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 animate-fade-in px-4">
        <div className="card-premium w-full max-w-sm p-6">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4af37]/10">
              <Lock className="h-6 w-6 text-[#c9952a]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-[#1a1a2e] mb-6">
            Acceso Administrador
          </h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (usuario === "admin" && clave === "123456") {
                setIsAuthenticated(true);
                setError(false);
              } else {
                setError(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-[#1a1a2e] mb-1 block">
                Usuario
              </label>
              <input
                type="text"
                className="input-premium w-full"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej: admin"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1a1a2e] mb-1 block">
                Contraseña
              </label>
              <input
                type="password"
                className="input-premium w-full"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="******"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center">
                Credenciales incorrectas.
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 mt-2">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
