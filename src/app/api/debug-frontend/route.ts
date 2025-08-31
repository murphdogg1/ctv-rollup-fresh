import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Frontend API test successful",
    timestamp: new Date().toISOString(),
    test: "This endpoint is working"
  })
}
