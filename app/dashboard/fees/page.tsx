import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, DollarSign } from "lucide-react"

async function getMonthlyFees(userId: string, userRole: string) {
  if (userRole === "USER") {
    return await prisma.monthlyFee.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })
  }

  // Manager/Admin can see all fees
  return await prisma.monthlyFee.findMany({
    include: {
      user: {
        select: { name: true, apartment: true },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default async function FeesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <div>Unauthorized</div>
  }

  const fees = await getMonthlyFees(session.user.id, session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monthly Fees</h1>
          <p className="text-muted-foreground">
            {session.user.role === "USER" ? "Your monthly fee payments" : "All resident monthly fees"}
          </p>
        </div>
        {["MANAGER", "ADMIN"].includes(session.user.role) && <Button>Add Monthly Fee</Button>}
      </div>

      <div className="grid gap-4">
        {fees.map((fee) => (
          <Card key={fee.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {monthNames[fee.month - 1]} {fee.year}
                    {session.user.role !== "USER" && fee.user && (
                      <span className="text-sm font-normal text-muted-foreground">
                        - {fee.user.name} ({fee.user.apartment})
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{fee.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-2xl font-bold">${fee.amount}</span>
                  </div>
                  <Badge variant={fee.isPaid ? "default" : "destructive"}>{fee.isPaid ? "Paid" : "Pending"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                {fee.isPaid && fee.paidAt && <span>Paid: {new Date(fee.paidAt).toLocaleDateString()}</span>}
              </div>
              {!fee.isPaid && session.user.role === "USER" && <Button className="mt-4 w-full">Pay Now</Button>}
              {["MANAGER", "ADMIN"].includes(session.user.role) && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {!fee.isPaid && <Button size="sm">Mark as Paid</Button>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {fees.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No monthly fees found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
