import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get("cookie")?.split(";").map(c => {
            const [name, value] = c.trim().split("=");
            return { name, value };
          }) || [];
        },
        setAll() {},
      },
    }
  );

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
