import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, EyeOff } from "lucide-react"
import { DonationForm } from "@/components/donation-form"

async function getDonations(userId: string, userRole: string) {
  if (userRole === "USER") {
    return await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }

  // Manager/Admin can see all visible donations + anonymous count
  const visibleDonations = await prisma.donation.findMany({
    where: { isVisible: true },
    include: {
      user: {
        select: { name: true, apartment: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const anonymousCount = await prisma.donation.count({
    where: { isVisible: false },
  })

  const anonymousTotal = await prisma.donation.aggregate({
    where: { isVisible: false },
    _sum: { amount: true },
  })

  return {
    visibleDonations,
    anonymousCount,
    anonymousTotal: anonymousTotal._sum.amount || 0,
  }
}

export default async function DonationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <div>Unauthorized</div>
  }

  const data = await getDonations(session.user.id, session.user.role)

  if (session.user.role === "USER") {
    const donations = data as any[]

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Donations</h1>
            <p className="text-muted-foreground">Your contributions to the building fund</p>
          </div>
          <DonationForm userId={session.user.id} />
        </div>

        <div className="grid gap-4">
          {donations.map((donation) => (
            <Card key={donation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />${donation.amount}
                    </CardTitle>
                    <CardDescription>{donation.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {donation.isVisible ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <EyeOff className="h-3 w-3" />
                        Anonymous
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Donated on {new Date(donation.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}

          {donations.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't made any donations yet</p>
                <DonationForm userId={session.user.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  const { visibleDonations, anonymousCount, anonymousTotal } = data as any

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Donations</h1>
        <p className="text-muted-foreground">Community contributions to the building fund</p>
      </div>

      {anonymousCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Anonymous Donations
            </CardTitle>
            <CardDescription>Private contributions from residents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">${anonymousTotal}</span>
              <Badge variant="secondary">{anonymousCount} donations</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {visibleDonations.map((donation: any) => (
          <Card key={donation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />${donation.amount}
                    <span className="text-sm font-normal text-muted-foreground">
                      by {donation.user.name} ({donation.user.apartment})
                    </span>
                  </CardTitle>
                  <CardDescription>{donation.description}</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Public
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Donated on {new Date(donation.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}

        {visibleDonations.length === 0 && anonymousCount === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No donations found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
