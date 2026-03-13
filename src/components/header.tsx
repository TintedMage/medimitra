"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  SidebarLeft01Icon,
  PillIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme_toggle";
import { useChatStore } from "@/lib/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const { toggleSidebar, toggleCalendar } = useChatStore();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
          <HugeiconsIcon icon={Menu01Icon} />
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            MediMitra
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={pathname === "/prescriptions" ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => router.push("/prescriptions")}
          aria-label="Go to prescriptions"
        >
          <HugeiconsIcon icon={PillIcon} />
        </Button>
        <ModeToggle />
        <Button variant="ghost" size="icon-sm" onClick={toggleCalendar}>
          <HugeiconsIcon icon={SidebarLeft01Icon} />
        </Button>
      </div>
    </header>
  );
}
