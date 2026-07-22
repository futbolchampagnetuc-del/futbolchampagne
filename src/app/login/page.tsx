"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al conectar");
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-600 to-green-800 px-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo / Título */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-3xl font-bold text-white">FutbolChampagne</h1>
          <p className="mt-2 text-base text-green-200">
            Organizá tus partidos con amigos
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Botón Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading || !supabase}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-gray-800 shadow-lg transition-all active:scale-95 disabled:opacity-70"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <p className="mt-6 text-xs text-green-300">
          Al ingresar, aceptás compartir tu nombre y email con la app
        </p>
      </div>
    </div>
  );
}
