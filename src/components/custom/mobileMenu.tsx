"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboardIcon,
  LogOut,
  Menu,
  UsersIcon,
  ViewIcon,
  MapPlusIcon,
} from "lucide-react";
import { logoutAction } from "@/data/actions/auth-actions";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const handleHide = () => {
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col items-end gap-4 w-42! bg-gray-100 dark:bg-gray-900 text-right">
        <div className="flex flex-col items-center border-b px-6 py-6">
          <DrawerTitle className="my-4">Menu</DrawerTitle>
          <Link
            className="flex items-center gap-2 font-semibold"
            href="/dashboard/create"
            onClick={handleHide}
          >
            <Button>
              <MapPlusIcon className="h-6 w-6" />
              Nowy Artykuł
            </Button>
          </Link>
        </div>
        <div className="flex-1 py-2 mb-1">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link
              className="flex items-center gap-2 font-semibold mb-4 mr-6"
              href="/dashboard"
              onClick={handleHide}
            >
              <LayoutDashboardIcon className="h-6 w-6" />
              Dashboard
            </Link>
            <Link
              className="flex items-center gap-2 font-semibold mb-4 mr-6 text-left"
              href="/dashboard"
              onClick={handleHide}
            >
              <ViewIcon className="h-6 w-6" />
              Moje artykuły
            </Link>

            <Link
              className="flex items-center gap-2 font-semibold mb-4 mr-6"
              href="/dashboard/account"
              onClick={handleHide}
            >
              <UsersIcon className="h-6 w-6" />
              Moje konto
            </Link>
          </nav>
          <Button onClick={logoutAction} className="mt-4 mr-10" variant="ghost">
            <LogOut className="w-4 h-4 hover:text-primary hover:opacity-90 cursor-pointer" />
            Wyloguj
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
