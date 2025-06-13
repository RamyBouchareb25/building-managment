import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Mail, Phone, Home } from "lucide-react"

async function getUsers() {
  return await prisma.user.findMany({
    include: {
      monthlyFees: {
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      },
      donations: {
        select: {
          amount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

const roleColors = {
  ADMIN: "destructive",
  MANAGER: "default",
  USER: "secondary",
} as const

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
    return <div>Unauthorized</div>
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage building residents and their accounts</p>
        </div>
        {session.user.role === "ADMIN" && <Button>Add User</Button>}
      </div>

      <div className="grid gap-4">
        {users.map((user) => {
          const currentMonthFee = user.monthlyFees[0]
          const totalDonations = user.donations.reduce((sum, d) => sum + d.amount, 0)

          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {user.name}
                        <Badge variant={roleColors[user.role]}>{user.role.toLowerCase()}</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.apartment && (
                          <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Apt {user.apartment}
                          </span>
                        )}
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">
                      {currentMonthFee ? (currentMonthFee.isPaid ? "Paid" : "Pending") : "No Fee"}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Month</div>
                    {currentMonthFee && <div className="text-xs text-muted-foreground">${currentMonthFee.amount}</div>}
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">${totalDonations}</div>
                    <div className="text-sm text-muted-foreground">Total Donations</div>
                    <div className="text-xs text-muted-foreground">{user.donations.length} donations</div>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{user.role}</div>
                    <div className="text-sm text-muted-foreground">Role</div>
                  </div>
                </div>

                {["MANAGER", "ADMIN"].includes(session.user.role) && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {session.user.role === "ADMIN" && user.role !== "ADMIN" && (
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    )}
                    {currentMonthFee && !currentMonthFee.isPaid && <Button size="sm">Mark Fee Paid</Button>}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
