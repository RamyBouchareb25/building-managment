import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { RevenueBarChart } from "@/components/charts/revenue_bar_chart";
import { ExpensePieChart } from "@/components/charts/expense_pie_chart";

async function getManagerDashboardData() {
  const currentYear = new Date().getFullYear();

  // Monthly revenue data for the year
  const monthlyRevenue = await prisma.monthlyFee.groupBy({
    by: ["month"],
    where: {
      year: currentYear,
      isPaid: true,
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      month: "asc",
    },
  });

  // Expense breakdown by type
  const expensesByType = await prisma.expense.groupBy({
    by: ["type"],
    _sum: {
      amount: true,
    },
    _count: true,
  });

  // Recent donations
  const recentDonations = await prisma.donation.findMany({
    where: { isVisible: true },
    include: {
      user: {
        select: { name: true, apartment: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Payment status overview
  const paymentStatus = await prisma.monthlyFee.groupBy({
    by: ["isPaid"],
    where: {
      month: new Date().getMonth() + 1,
      year: currentYear,
    },
    _count: true,
    _sum: {
      amount: true,
    },
  });

  // Total statistics
  const totalUsers = await prisma.user.count();
  const totalRevenue = await prisma.monthlyFee.aggregate({
    where: { isPaid: true },
    _sum: { amount: true },
  });
  const totalDonations = await prisma.donation.aggregate({
    _sum: { amount: true },
  });
  const pendingExpenses = await prisma.expense.count({
    where: { status: "PENDING" },
  });

  return {
    monthlyRevenue,
    expensesByType,
    recentDonations,
    paymentStatus,
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalDonations: totalDonations._sum.amount || 0,
    pendingExpenses,
  };
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
    return <div>Unauthorized</div>;
  }

  const data = await getManagerDashboardData();

  // Format data for charts
  const revenueChartData = monthNames.map((month, index) => {
    const monthData = data.monthlyRevenue.find(
      (item) => item.month === index + 1
    );
    return {
      month,
      revenue: monthData?._sum.amount || 0,
    };
  });

  const expenseChartData = data.expensesByType.map((item) => ({
    type: item.type === "MONTHLY" ? "Monthly" : "One-time",
    amount: item._sum.amount || 0,
    count: item._count,
  }));

  const paymentChartData = data.paymentStatus.map((item) => ({
    status: item.isPaid ? "Paid" : "Pending",
    count: item._count,
    amount: item._sum.amount || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Building management overview and analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered residents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From monthly fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Donations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalDonations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Extra contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Expenses
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingExpenses}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue from monthly fees throughout the year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={revenueChartData} />
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution of expenses by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={expenseChartData} colors={COLORS} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month Payment Status</CardTitle>
            <CardDescription>Monthly fee payment overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentChartData.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No payment data available for this month
                </p>
              )}
              {paymentChartData.map((item, index) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-medium">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.count} residents</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>
              Latest contributions from residents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{donation.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${donation.amount}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {data.recentDonations.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No recent donations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
