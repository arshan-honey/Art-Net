import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Test API endpoint working", timestamp: new Date().toISOString() })
}
