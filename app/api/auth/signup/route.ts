import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ENTHUSIAST", "ARTIST"]),
  artistData: z
    .object({
      artistStatement: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      acceptCommissions: z.boolean().optional(),
    })
    .optional(),
})

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Attempt signup
    const result = await AuthService.signup(validatedData)

    if (!result) {
      return NextResponse.json({ error: "Failed to create account. User may already exist." }, { status: 400 })
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Account created successfully",
    })

    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Signup API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
