"use client"

import {
  BellIcon,
  UserCircleIcon,
  MoreVerticalIcon,
  LogOutIcon,
  LogInIcon,
  BarChart2Icon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NavUser({
  user = {
    name: "Guest User",
    email: "guest@finac.com",
    avatar: "/icons/user-male-circle.png",
    isGuest: true
  }
}: {
  user?: {
    name: string
    email: string
    avatar: string
    isGuest?: boolean
  }
}) {
  return (
    <div className="mt-auto px-3 py-2 border-t border-gray-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left text-sm leading-tight">
              <span className="block font-medium truncate">{user.name}</span>
              <span className="text-xs text-gray-500 truncate">
                {user.email}
              </span>
            </div>
            <MoreVerticalIcon className="ml-auto size-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 rounded-lg"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {user.isGuest ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem>
                      <LogInIcon className="mr-2 h-4 w-4" />
                      Sign In
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign in to save your data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <DropdownMenuItem>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <BarChart2Icon className="mr-2 h-4 w-4" />
              Usage
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserCircleIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
