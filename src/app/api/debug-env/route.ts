import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    environment: {
      DB_ENGINE: process.env.DB_ENGINE,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    message: "Environment variables debug info"
  })
}
