import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
// import { BrainCircuit } from "lucide-react";
import CertifyYTLogo from "@/components/shared/certifyyt-logo";
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/10 shadow-lg transition-all duration-300">
    <div className="container grid grid-cols-2 sm:grid-cols-3 items-center h-16 sm:h-20 px-4 sm:px-6 lg:px-8 mx-auto">
      
      {/* Left Section - Logo */}
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          className="flex items-center space-x-3 hover:scale-105 transition-all duration-300 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <CertifyYTLogo className="relative h-8 w-8 sm:h-9 sm:w-9 text-purple-500 transition-all duration-300 group-hover:text-blue-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black gradient-text">
            CertifyYT
          </span>
        </Link>
      </div>
  
      {/* Center Section - Navigation */}
      <nav className="hidden md:flex items-center justify-center space-x-4 sm:space-x-8">
        <Link
          href="/"
          className="text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium"
        >
          Dashboard
        </Link>
      </nav>
  
      {/* Right Section - User Nav */}
      <div className="flex items-center justify-end space-x-2 sm:space-x-3">
        <UserNav />
      </div>
    </div>
  </header>
  
  );
}
