"use client"
import React, { useEffect, useState } from 'react';
import { Menu, X, User, Home, ShoppingBag, Heart, Settings, LogOut, Plus, Package, Wallet } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setEmail(user?.email ?? '');
      }
    }
    getUserEmail();
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: ShoppingBag, label: 'My Bids', href: '/bids' },
    { icon: Package, label: 'My Orders', href: '/order' },
    { icon: Heart, label: 'Watchlist', href: '/watchlist' },
    { icon: Wallet, label: 'Reload Balance', href: '/reload' },
    { icon: Plus, label: 'Post', href: '/post' },
  ];

  const goToProfile = () => {
    router.push('/profile');
  }
  return (
    <nav className="w-full bg-white border-b border-gray-200 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger Menu */}
          <div className="flex-shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-100"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* App Name */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-gray-900">BidBay</h1>
          </div>

          {/* Profile Menu */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <User className="h-6 w-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-3">
                  <p className="text-sm">Signed in as</p>
                  <p className="text-sm font-medium truncate">{email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
            
                  <span onClick={goToProfile}>Profile</span>
                </DropdownMenuItem>
            
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;