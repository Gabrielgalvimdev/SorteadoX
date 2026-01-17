"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Ticket, HelpCircle, Repeat, Scale, TestTube2, List } from "lucide-react";
import type { List as ListType } from '@/types';

interface DrawingPanelProps {
  list: ListType | undefined;
  onDraw: (quantity: number, withReplacement: boolean, fairMode: boolean, dryRun: boolean) => void;
}

export function DrawingPanel({ list, onDraw }: DrawingPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [withReplacement, setWithReplacement] = useState(false);
  const [fairMode, setFairMode] = useState(false);
  const [dryRun, setDryRun] = useState(false);

  const handleDrawClick = () => {
    onDraw(quantity, withReplacement, fairMode, dryRun);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    } else {
      setQuantity(1);
    }
  };

  if (!list) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Ticket className="mr-2 h-6 w-6" />Painel de Sorteio</CardTitle>
        <CardDescription>Configure e realize o sorteio para a lista "{list.name}".</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantos nomes sortear?</Label>
          <Input 
            id="quantity" 
            type="number" 
            value={quantity} 
            onChange={handleQuantityChange} 
            min="1" 
            className="max-w-xs"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="with-replacement" className="flex items-center">
              <Repeat className="mr-2 h-4 w-4" />
              Sorteio com reposição
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Permite que o mesmo nome seja sorteado mais de uma vez.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Switch id="with-replacement" checked={withReplacement} onCheckedChange={setWithReplacement} disabled={fairMode} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="fair-mode" className="flex items-center">
              <Scale className="mr-2 h-4 w-4" />
              Modo Justo
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Garante que todos sejam sorteados uma vez antes de repetir.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Switch id="fair-mode" checked={fairMode} onCheckedChange={(checked) => { setFairMode(checked); if (checked) setWithReplacement(false); }} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dry-run" className="flex items-center">
              <TestTube2 className="mr-2 h-4 w-4" />
              Simular sorteio (Dry Run)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="ml-2 h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent><p>Executa o sorteio, mas não salva o resultado no histórico.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Switch id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
          </div>
        </div>

        <Button onClick={handleDrawClick} className="w-full font-bold text-lg py-6" size="lg" disabled={list.names.length === 0}>
          <Ticket className="mr-2 h-5 w-5" />
          Sortear
        </Button>
      </CardContent>
    </Card>
  );
}
