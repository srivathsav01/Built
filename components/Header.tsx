"use client";

import { memo, useState,useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react'
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User as UserIcon } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoading } from '@/lib/context/LoadingContext';
import { createSupabaseClient } from '@/lib/supabase/client';

const Header = memo(() => {
  const user = useCurrentUser();
  const {setIsLoading} = useLoading();
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = "/" + usePathname().split("/")[1]
  const isAuthenticated = !!user;

  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };
  
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-10 bg-background">
        <div className="max-w-300 mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div></div>
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${pathname === '/'
                  ? 'text-primary-foreground bg-primary'
                  : 'text-foreground hover:text-primary hover:bg-accent/50'
                  }`}
              >
                Home
              </Link>

              <Link
                href="/upload"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${pathname === '/upload'
                  ? 'text-primary-foreground bg-primary'
                  : 'text-foreground hover:text-primary hover:bg-accent/50'
                  }`}
              >
                Upload
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 ml-2">
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-300 focus-ring"
                    title={user?.user_metadata.display_name || user?.email || "Profile"}
                  >
                    <UserIcon size={18} />
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-300 focus-ring"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : ( 
                  <Link                   href="/login"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm text-foreground hover:text-primary hover:bg-accent/50 ml-2 ${pathname === '/login'
                    ? 'text-primary-foreground bg-primary'
                    : 'text-foreground hover:text-primary hover:bg-accent/50'
                    }`}
                >
                  Login
                </Link>
              )}
              <button
                onClick={() => theme == 'light' ? setTheme("dark") : setTheme("light")}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-300 focus-ring overflow-hidden ml-2"
              >
                <Sun
                  className={`absolute transition-all duration-500 transform ${theme === 'dark'
                    ? 'rotate-90 scale-0 opacity-0'
                    : 'rotate-0 scale-100 opacity-100'
                    }`}
                  size={18}
                />
                <Moon
                  className={`absolute transition-all duration-500 transform ${theme === 'dark'
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                    }`}
                  size={18}
                />
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(previous => !previous)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-300 focus-ring"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-border space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${pathname === '/'
                  ? 'text-primary-foreground bg-primary'
                  : 'text-foreground hover:text-primary hover:bg-accent/50'
                  }`}
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm text-foreground hover:text-primary hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      <span>{user?.user_metadata.display_name || user?.email || "Profile"}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm text-foreground hover:text-primary hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </div>
                  </button>
                </>
              ) : ( <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm text-foreground hover:text-primary hover:bg-accent/50"
                >
                  Login
                </Link>
              )}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => theme == 'light' ? setTheme("dark") : setTheme("light")}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium text-sm"
                >
                  <span>Theme</span>
                  <div className="relative flex items-center justify-center w-5 h-5">
                    {theme == 'light' ?
                      <Sun className="" size={16} /> :
                      <Moon className="" size={16} />
                    }
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
})

export default Header