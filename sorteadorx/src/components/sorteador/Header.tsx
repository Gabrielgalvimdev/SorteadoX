"use client";

import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-lg sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
                <Ticket className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground tracking-tight">
              SorteadorX
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
