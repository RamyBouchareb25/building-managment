import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wrench, Calendar, DollarSign } from "lucide-react"

async function getExpenses() {
  return await prisma.expense.findMany({
    include: {
      createdBy: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

const statusColors = {
  PENDING: "destructive",
  APPROVED: "default",
  COMPLETED: "secondary",
  CANCELLED: "outline",
} as const

const typeLabels = {
  MONTHLY: "Monthly",
  OCCASIONAL: "One-time",
} as const

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <div>Unauthorized</div>
  }

  const expenses = await getExpenses()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Building maintenance and operational costs</p>
        </div>
        {["MANAGER", "ADMIN"].includes(session.user.role) && <Button>Add Expense</Button>}
      </div>

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {expense.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{expense.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-2xl font-bold">${expense.amount}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={statusColors[expense.status]}>{expense.status.toLowerCase()}</Badge>
                    <Badge variant="outline">{typeLabels[expense.type]}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span>Created by {expense.createdBy.name}</span>
                <span>Created {new Date(expense.createdAt).toLocaleDateString()}</span>
              </div>

              {expense.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(expense.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {expense.completedAt && (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Completed: {new Date(expense.completedAt).toLocaleDateString()}</span>
                </div>
              )}

              {["MANAGER", "ADMIN"].includes(session.user.role) && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {expense.status === "PENDING" && (
                    <>
                      <Button size="sm">Approve</Button>
                      <Button variant="destructive" size="sm">
                        Reject
                      </Button>
                    </>
                  )}
                  {expense.status === "APPROVED" && <Button size="sm">Mark Complete</Button>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {expenses.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No expenses found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
