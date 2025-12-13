'use client';

import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ImportDataDialog from '@/components/entries/import-data-dialog';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';

interface HeaderProps {
  onLogout: () => Promise<void>;
  vehicles?: Vehicle[];
  onImportSuccess?: () => void;
}

export default function Header({ onLogout, vehicles = [], onImportSuccess }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50">
      <div className="relative">
        {/* Glassmorphism background with blur - matching navigation */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/85 shadow-[0_2px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)]" />
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center group">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent transition-all group-hover:from-blue-500 group-hover:to-blue-300">
              FuelSense
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {vehicles.length > 0 && (
              <div>
                <ImportDataDialog vehicles={vehicles} onSuccess={onImportSuccess || (() => {})} />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 transition-all duration-300 ease-in-out hover:bg-stone-100/50 dark:hover:bg-slate-800/50 rounded-lg hover:shadow-md"
                >
                  <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="hidden sm:inline text-stone-600 dark:text-stone-300 text-sm truncate max-w-[150px]">
                    {user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-48">
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
