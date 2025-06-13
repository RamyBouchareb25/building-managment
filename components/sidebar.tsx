"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Building2,
  Home,
  DollarSign,
  Heart,
  Wrench,
  Users,
  BarChart3,
  Menu,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["USER", "MANAGER", "ADMIN"] },
  { name: "Monthly Fees", href: "/dashboard/fees", icon: DollarSign, roles: ["USER", "MANAGER", "ADMIN"] },
  { name: "Donations", href: "/dashboard/donations", icon: Heart, roles: ["USER", "MANAGER", "ADMIN"] },
  { name: "Expenses", href: "/dashboard/expenses", icon: Wrench, roles: ["USER", "MANAGER", "ADMIN"] },
  { name: "Users", href: "/manager/users", icon: Users, roles: ["MANAGER", "ADMIN"] },
  { name: "Manager Dashboard", href: "/manager", icon: BarChart3, roles: ["MANAGER", "ADMIN"] },
  { name: "Admin Dashboard", href: "/admin", icon: Shield, roles: ["ADMIN"] },
  { name: "System Health", href: "/admin/system", icon: UserCog, roles: ["ADMIN"] },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const userRole = session?.user?.role || "USER"

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Building2 className="h-6 w-6 text-blue-600" />
        <span className="ml-2 text-lg font-semibold">Building Manager</span>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">{session?.user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={cn("hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0", className)}>
        <div className="flex flex-col flex-grow border-r bg-card">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
