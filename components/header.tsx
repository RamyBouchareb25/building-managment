"use client"

import { useSession } from "next-auth/react"
import { Sidebar } from "./sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="md:hidden">
          <Sidebar />
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
