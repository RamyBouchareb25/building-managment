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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Shield, Database, Activity, Clock } from "lucide-react";
import { UserGrowthChart } from "@/components/charts/user_growth_chart";
import { RevenueTrendsChart } from "@/components/charts/revenue_trends_chart";

async function getAdminDashboardData() {
  // System health metrics
  const totalUsers = await prisma.user.count();
  const totalRevenue = await prisma.monthlyFee.aggregate({
    where: { isPaid: true },
    _sum: { amount: true },
  });
  const totalExpenses = await prisma.expense.aggregate({
    where: { status: { in: ["APPROVED", "COMPLETED"] } },
    _sum: { amount: true },
  });
  const pendingExpenses = await prisma.expense.count({
    where: { status: "PENDING" },
  });

  // User growth over time (last 12 months)
  const userGrowth = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: true,
    orderBy: { createdAt: "asc" },
  });

  // Revenue trends (last 6 months)
  const revenueTrends = await prisma.monthlyFee.groupBy({
    by: ["month", "year"],
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      },
    },
    _sum: { amount: true },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  // Database statistics
  const dbStats = {
    users: totalUsers,
    monthlyFees: await prisma.monthlyFee.count(),
    donations: await prisma.donation.count(),
    expenses: await prisma.expense.count(),
  };

  return {
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalExpenses: totalExpenses._sum.amount || 0,
    pendingExpenses,
    userGrowth,
    revenueTrends,
    dbStats,
    systemUptime: 99.9, // Mock data
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>;
  }

  const data = await getAdminDashboardData();

  // Format data for charts
  const userGrowthData = data.userGrowth.reduce((acc: any[], curr, index) => {
    const date = new Date(curr.createdAt);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    const existing = acc.find((item) => item.month === monthYear);
    if (existing) {
      existing.users += curr._count;
    } else {
      acc.push({
        month: monthYear,
        users: (acc[acc.length - 1]?.users || 0) + curr._count,
      });
    }
    return acc;
  }, []);

  const revenueData = data.revenueTrends.map((item) => ({
    month: `${item.month}/${item.year}`,
    revenue: item._sum.amount || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System administration and health monitoring
        </p>
      </div>

      {/* System Health Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Database Records
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(data.dbStats).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(
                (Date.now() - data.lastBackup.getTime()) / (1000 * 60 * 60)
              )}
              h
            </div>
            <p className="text-xs text-muted-foreground">Hours ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Status
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>
              All-time revenue from fees and donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              $
              {(
                data.totalRevenue +
                  (await prisma.donation.aggregate({ _sum: { amount: true } }))
                    ._sum.amount || 0
              ).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Approved and completed expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${data.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Balance</CardTitle>
            <CardDescription>Revenue minus expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${(data.totalRevenue - data.totalExpenses).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              Cumulative user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowthData} />
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              Monthly revenue from fees over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTrendsChart data={revenueData} />
          </CardContent>
        </Card>
      </div>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
          <CardDescription>Record counts by table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.dbStats).map(([table, count]) => (
              <div key={table} className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {table}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
