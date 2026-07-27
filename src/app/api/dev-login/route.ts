import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  try {
    const admin = createAdminClient();

    const devEmail = "dev@futbolchampagne.com";
    const devPassword = "dev123456";

    // 1. Intentar crear usuario de desarrollo
    const { error: createError } = await admin.auth.admin.createUser({
      email: devEmail,
      password: devPassword,
      email_confirm: true,
      user_metadata: { full_name: "Usuario de Desarrollo" },
    });

    // 2. Iniciar sesión (funciona si ya existe o recién creado)
    const { data: signInData, error: signInError } =
      await admin.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

    const session = signInData?.session ?? null;

    if (signInError || !session) {
      console.error("Error sign in:", signInError ?? "No session");
      return NextResponse.json(
        {
          error:
            "No se pudo crear sesión. Asegurate de tener Email/Password habilitado en Supabase Auth → Settings → Email + Password (ON).",
        },
        { status: 500 }
      );
    }

    // 3. Crear respuesta y setear sesión via Supabase SSR
    const response = NextResponse.redirect(new URL("/", request.url));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    return response;
  } catch (err) {
    console.error("Dev login error:", err);
    return NextResponse.json(
      {
        error:
          "Error interno: " +
          (err instanceof Error ? err.message : String(err)),
      },
      { status: 500 }
    );
  }
}
