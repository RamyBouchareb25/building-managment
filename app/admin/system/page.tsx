import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Server,
  Database,
  Shield,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react"

export default async function SystemHealthPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>
  }

  // Mock system health data - in a real app, this would come from actual system monitoring
  const systemHealth = {
    server: {
      status: "healthy",
      uptime: "99.9%",
      lastRestart: "2024-12-01T10:30:00Z",
      memoryUsage: "45%",
      cpuUsage: "23%",
    },
    database: {
      status: "healthy",
      connections: 12,
      maxConnections: 100,
      lastBackup: "2024-12-11T02:00:00Z",
      size: "2.3 GB",
    },
    security: {
      status: "secure",
      lastSecurityScan: "2024-12-10T14:00:00Z",
      vulnerabilities: 0,
      failedLogins: 3,
    },
    backups: {
      status: "up-to-date",
      lastBackup: "2024-12-11T02:00:00Z",
      backupSize: "1.8 GB",
      retentionDays: 30,
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "secure":
      case "up-to-date":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "secure":
      case "up-to-date":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">Monitor system performance and manage developer settings</p>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemHealth.server.status)}
              <Badge variant={getStatusColor(systemHealth.server.status)}>{systemHealth.server.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Uptime: {systemHealth.server.uptime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemHealth.database.status)}
              <Badge variant={getStatusColor(systemHealth.database.status)}>{systemHealth.database.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Size: {systemHealth.database.size}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemHealth.security.status)}
              <Badge variant={getStatusColor(systemHealth.security.status)}>{systemHealth.security.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {systemHealth.security.vulnerabilities} vulnerabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemHealth.backups.status)}
              <Badge variant={getStatusColor(systemHealth.backups.status)}>{systemHealth.backups.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last: {new Date(systemHealth.backups.lastBackup).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed System Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Server Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Information
            </CardTitle>
            <CardDescription>Current server performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm">{systemHealth.server.memoryUsage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">CPU Usage</span>
              <span className="text-sm">{systemHealth.server.cpuUsage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Restart</span>
              <span className="text-sm">{new Date(systemHealth.server.lastRestart).toLocaleDateString()}</span>
            </div>
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Server
            </Button>
          </CardContent>
        </Card>

        {/* Database Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Information
            </CardTitle>
            <CardDescription>Database performance and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm">
                {systemHealth.database.connections}/{systemHealth.database.maxConnections}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Database Size</span>
              <span className="text-sm">{systemHealth.database.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Backup</span>
              <span className="text-sm">{new Date(systemHealth.database.lastBackup).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Backup Now
              </Button>
              <Button variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Restore
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Maintenance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status
            </CardTitle>
            <CardDescription>Security monitoring and threat detection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Vulnerabilities</span>
              <span className="text-sm">{systemHealth.security.vulnerabilities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Failed Login Attempts</span>
              <span className="text-sm">{systemHealth.security.failedLogins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Security Scan</span>
              <span className="text-sm">{new Date(systemHealth.security.lastSecurityScan).toLocaleDateString()}</span>
            </div>
            <Button variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </CardContent>
        </Card>

        {/* Developer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Developer Settings
            </CardTitle>
            <CardDescription>System configuration and maintenance tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Database Migration
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Environment Variables
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset System
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Logs</CardTitle>
          <CardDescription>Latest system events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[
              { time: "2024-12-12 10:30:15", level: "INFO", message: "User login successful: admin@building.com" },
              { time: "2024-12-12 10:25:42", level: "INFO", message: "Database backup completed successfully" },
              { time: "2024-12-12 09:15:33", level: "WARN", message: "High memory usage detected: 85%" },
              { time: "2024-12-12 08:45:21", level: "INFO", message: "Monthly fee payment processed: $150.00" },
              { time: "2024-12-12 08:30:12", level: "ERROR", message: "Failed login attempt from IP: 192.168.1.100" },
              { time: "2024-12-12 07:00:00", level: "INFO", message: "Automated backup started" },
            ].map((log, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm p-2 rounded border">
                <span className="text-muted-foreground font-mono">{log.time}</span>
                <Badge
                  variant={log.level === "ERROR" ? "destructive" : log.level === "WARN" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {log.level}
                </Badge>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
