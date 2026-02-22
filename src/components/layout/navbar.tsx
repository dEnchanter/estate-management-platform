"use client"

import { BellIcon, SearchIcon, Command, LogOut, User, Settings, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentUser, useLogout } from "@/hooks/use-auth"
import { getInitials } from "@/lib/utils"

export function Navbar() {
  const router = useRouter()
  const logout = useLogout()
  const { data: user } = useCurrentUser()

  // Get user initials for avatar fallback
  const userInitials = user?.name ? getInitials(user.name) : "U"
  const userName = user?.name || "User"
  const userRole = user?.profileType || user?.categoryName || "User"

  const handleLogout = () => {
    // Clear localStorage
    logout()

    // Also clear sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.clear()
    }

    // Redirect to login page
    router.push("/")
  }

  return (
    <header className="fixed top-0 right-0 z-30 h-16 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-8 left-[258px]">
      <div className="flex items-center gap-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Search Bar with Keyboard Shortcut */}
        <div className="relative flex items-center w-80 group">
          <SearchIcon className="absolute left-3 w-4 h-4 text-[#5b5b66] transition-colors group-focus-within:text-[#1f1f3f]" />
          <Input
            placeholder="Search..."
            className="w-full pl-9 pr-16 py-1.5 h-9 bg-[#f4f4f9] border-0 rounded-lg [font-family:'SF_Pro-Regular',Helvetica] text-sm text-[#5b5b66] placeholder:text-[#acacbf] focus-visible:ring-2 focus-visible:ring-[#1f1f3f]/20 focus-visible:ring-offset-0 focus-visible:bg-white transition-all"
          />
          {/* Keyboard shortcut hint */}
          <div className="absolute right-3 flex items-center gap-1 opacity-50 group-focus-within:opacity-0 transition-opacity">
            <kbd className="px-1.5 py-0.5 text-xs font-medium text-[#5b5b66] bg-white border border-gray-200 rounded">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs font-medium text-[#5b5b66] bg-white border border-gray-200 rounded">
              K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Quick Actions */}
          {/* <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-sm text-[#5b5b66] hover:text-[#1f1f3f] hover:bg-gray-100 rounded-lg transition-colors [font-family:'SF_Pro-Medium',Helvetica]"
          >
            Quick Add
          </Button> */}

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-gray-100 rounded-lg relative transition-all hover:scale-105"
          >
            <BellIcon className="w-5 h-5 text-[#5b5b66]" />
            {/* Animated notification badge */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200"></div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 px-2 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
              >
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                  <AvatarImage src={user?.communityLogo || "/avatar.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-[#1f1f3f] to-[#2f5fbf] text-white text-xs [font-family:'SF_Pro-Semibold',Helvetica]">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:flex flex-col items-start">
                  <span className="text-xs [font-family:'SF_Pro-Semibold',Helvetica] text-[#242426] leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] [font-family:'SF_Pro-Regular',Helvetica] text-[#acacbf] leading-tight">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#5b5b66] ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || user?.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
