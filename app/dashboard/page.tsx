import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Heart, Wrench, Users } from "lucide-react"

async function getDashboardData(userId: string, userRole: string) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  if (userRole === "USER") {
    // User-specific data
    const monthlyFee = await prisma.monthlyFee.findFirst({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    })

    const userDonations = await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return {
      monthlyFee,
      userDonations,
      totalDonated: userDonations.reduce((sum, d) => sum + d.amount, 0),
    }
  }

  // Manager/Admin data
  const totalUsers = await prisma.user.count()
  const totalRevenue = await prisma.monthlyFee.aggregate({
    where: { isPaid: true },
    _sum: { amount: true },
  })
  const totalDonations = await prisma.donation.aggregate({
    _sum: { amount: true },
  })
  const pendingExpenses = await prisma.expense.count({
    where: { status: "PENDING" },
  })

  return {
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalDonations: totalDonations._sum.amount || 0,
    pendingExpenses,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <div>Unauthorized</div>
  }

  const data = await getDashboardData(session.user.id, session.user.role)

  if (session.user.role === "USER") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
          <p className="text-muted-foreground">Here's your building account overview</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Fee Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.monthlyFee?.isPaid ? "Paid" : "Pending"}</div>
              <p className="text-xs text-muted-foreground">
                {data.monthlyFee ? `$${data.monthlyFee.amount}` : "No fee set"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data.totalDonated}</div>
              <p className="text-xs text-muted-foreground">{data.userDonations.length} donations made</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your recent contributions to the building fund</CardDescription>
          </CardHeader>
          <CardContent>
            {data.userDonations.length > 0 ? (
              <div className="space-y-2">
                {data.userDonations.map((donation) => (
                  <div key={donation.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">${donation.amount}</p>
                      <p className="text-sm text-muted-foreground">{donation.description}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(donation.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No donations yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Building management overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered residents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">From monthly fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalDonations}</div>
            <p className="text-xs text-muted-foreground">Extra contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingExpenses}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
