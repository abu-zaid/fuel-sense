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
import type { Vehicle } from '@/lib/types';

interface HeaderProps {
  onLogout: () => Promise<void>;
  vehicles?: Vehicle[];
  onImportSuccess?: () => void;
}

export default function Header({ onLogout, vehicles = [], onImportSuccess }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-gradient-to-r from-white via-white/95 to-stone-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800/50 backdrop-blur-md border-b border-stone-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 group">
          <span className="text-3xl transition-transform group-hover:scale-110 group-hover:rotate-12">⛽</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent transition-all group-hover:from-blue-500 group-hover:to-blue-400">
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
                className="gap-2 transition-all duration-300 ease-in-out hover:bg-stone-100 dark:hover:bg-slate-800 rounded-lg hover:shadow-md"
              >
                <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline text-stone-600 dark:text-stone-300 text-sm truncate max-w-[150px]">
                  {user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem 
                onClick={onLogout} 
                className="gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all duration-300 ease-in-out"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
