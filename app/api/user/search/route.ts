import { type NextRequest, NextResponse } from "next/server"
import { UserService } from "@/lib/services/user.service"
import type { SearchFilters } from "@/lib/types/user"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: SearchFilters = {
      query: searchParams.get("query") || undefined,
      categories: searchParams.getAll("categories"),
      mediums: searchParams.getAll("mediums"),
      sortBy: (searchParams.get("sortBy") as any) || "RELEVANCE",
      artistId: searchParams.get("artistId") || undefined,
      isForSale:
        searchParams.get("isForSale") === "true" ? true : searchParams.get("isForSale") === "false" ? false : undefined,
    }

    if (searchParams.get("minPrice")) {
      filters.priceRange = {
        ...filters.priceRange,
        min: Number.parseFloat(searchParams.get("minPrice")!),
      }
    }

    if (searchParams.get("maxPrice")) {
      filters.priceRange = {
        ...filters.priceRange,
        max: Number.parseFloat(searchParams.get("maxPrice")!),
      }
    }

    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const results = await UserService.searchContent(filters, limit, offset)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
