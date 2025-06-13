import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, isVisible, userId } = await request.json()

    // Ensure user can only create donations for themselves unless they're admin/manager
    if (session.user.id !== userId && !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const donation = await prisma.donation.create({
      data: {
        amount,
        description,
        isVisible,
        userId,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("Donation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let donations

    if (session.user.role === "USER") {
      // Users can only see their own donations
      donations = await prisma.donation.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Managers and admins can see all donations
      donations = await prisma.donation.findMany({
        include: {
          user: {
            select: { name: true, apartment: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(donations)
  } catch (error) {
    console.error("Donations fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
