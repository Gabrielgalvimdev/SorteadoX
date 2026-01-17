"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DrawResult } from "@/types";
import { Trophy, Gift, Users } from "lucide-react";
import React from 'react';

interface DrawingResultsProps {
  result: DrawResult;
}

export function DrawingResults({ result }: DrawingResultsProps) {
  const isSingleWinner = result.drawnNames.length === 1;

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          {isSingleWinner ? <Trophy className="mr-2 h-6 w-6" /> : <Gift className="mr-2 h-6 w-6" />}
          Resultado do Sorteio
        </CardTitle>
        <CardDescription>
          {isSingleWinner ? "O grande vencedor é..." : `Os ${result.drawnNames.length} vencedores são...`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4">
          {result.drawnNames.map((name, index) => (
            <div
              key={name.id}
              className="winner-animate"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Badge 
                variant="default"
                className="bg-accent text-accent-foreground text-xl lg:text-2xl font-bold px-6 py-3 shadow-lg transform hover:scale-105 transition-transform"
              >
                {name.name}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
