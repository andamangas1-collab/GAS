import Link from "next/link"
import { GASLogo } from "@/components/branding/GASLogo"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <GASLogo variant="full" size="sm" />
            <div className="flex flex-col sm:border-l sm:border-border/60 sm:pl-4">
              <span className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} <strong className="font-semibold text-foreground">GAS™</strong> — Grand Affiliate System. All rights reserved.
              </span>
              <span className="text-[11px] text-muted-foreground/80 mt-0.5 tracking-wide">
                Designed &amp; Developed with <span className="text-rose-500 font-bold">♥</span> by{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gas-600 via-emerald-600 to-teal-500 hover:opacity-95 transition-opacity">
                  Bhabha IT Solution
                </span>
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/offers" className="hover:text-foreground transition-colors">Offers</Link>
            <Link href="/refer" className="hover:text-foreground transition-colors">Refer</Link>
            <Link href="/contribute" className="hover:text-foreground transition-colors">Contribute</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

