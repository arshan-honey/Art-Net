import { NextRequest, NextResponse } from "next/server"
import { CategoryService } from "@/lib/services/category.service"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trending = searchParams.get('trending') === 'true'
    const limit = parseInt(searchParams.get('limit') || '0')

    const categories = await CategoryService.getCategories({
      trending,
      limit: limit || undefined,
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error in GET /api/art-categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
