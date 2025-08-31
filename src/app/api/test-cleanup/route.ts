import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Cleanup test endpoint is accessible",
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Cleanup test POST endpoint is accessible",
    timestamp: new Date().toISOString()
  })
}
