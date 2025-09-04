"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginButton } from "./login-button";
import Link from "next/link";
import { LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function UserNav() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <Skeleton className="h-10 w-28 rounded-full" />;
  }

  if (!user) {
    return <LoginButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-full hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-300"
        >
          <Avatar className="h-9 w-9 sm:h-11 sm:w-11">
            <AvatarImage
              src={user.photoURL ?? ""}
              alt={user.displayName ?? "User"}
              className="transition-all duration-300 hover:scale-105"
            />
            <AvatarFallback>
              {user.displayName?.charAt(0)?.toUpperCase() ?? <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 shadow-lg rounded-xl border border-border/60 bg-background/95 backdrop-blur-md"
        align="end"
        forceMount
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs sm:text-sm font-semibold leading-none">
              {user.displayName}
            </p>
            <p className="text-xs sm:text-sm leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dashboard Link */}
        <DropdownMenuGroup>
          <Link href="/dashboard" passHref>
            <DropdownMenuItem className="flex items-center gap-2 transition-colors hover:bg-primary/10">
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={signOut}
          className="flex items-center gap-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
