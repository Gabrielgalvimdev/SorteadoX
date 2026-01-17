"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { List, Name, DrawResult } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/sorteador/Header';
import { ListManager } from '@/components/sorteador/ListManager';
import { DrawingPanel } from '@/components/sorteador/DrawingPanel';
import { DrawingResults } from '@/components/sorteador/DrawingResults';
import { DrawingHistory } from '@/components/sorteador/DrawingHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function SorteadorApp() {
  const { toast } = useToast();
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [history, setHistory] = useState<DrawResult[]>([]);
  const [lastResult, setLastResult] = useState<DrawResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const storedLists = localStorage.getItem('sorteador-x-lists');
        const storedHistory = localStorage.getItem('sorteador-x-history');
        
        if (storedLists) {
          const parsedLists: List[] = JSON.parse(storedLists);
          setLists(parsedLists);
          if (parsedLists.length > 0 && !selectedListId) {
            setSelectedListId(parsedLists[0].id);
          }
        }
        
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory).map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
        }
      } catch (error) {
        console.error("Falha ao carregar do armazenamento local", error);
        toast({ variant: "destructive", title: "Erro ao Carregar", description: "Não foi possível carregar os dados salvos." });
      }
    }
  }, [isClient, toast]);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('sorteador-x-lists', JSON.stringify(lists));
      } catch (error) {
        console.error("Falha ao salvar listas no armazenamento local", error);
      }
    }
  }, [lists, isClient]);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('sorteador-x-history', JSON.stringify(history));
      } catch (error) {
        console.error("Falha ao salvar histórico no armazenamento local", error);
      }
    }
  }, [history, isClient]);

  const selectedList = useMemo(() => lists.find(l => l.id === selectedListId), [lists, selectedListId]);
  const listHistory = useMemo(() => history.filter(h => h.listId === selectedListId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()), [history, selectedListId]);

  const handleCreateList = useCallback((name: string, description: string) => {
    const newList: List = { id: crypto.randomUUID(), name, description, names: [], drawnNames: [] };
    setLists(prev => [...prev, newList]);
    setSelectedListId(newList.id);
    toast({ title: "Lista Criada!", description: `A lista "${name}" foi criada com sucesso.` });
  }, [toast]);

  const updateList = useCallback((updatedList: List) => {
    setLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  }, []);

  const handleAddName = useCallback((name: string) => {
    if (!selectedList) return;
    if (selectedList.names.some(n => n.name.toLowerCase() === name.toLowerCase())) {
        toast({ variant: "destructive", title: "Nome Duplicado", description: "Este nome já existe na lista." });
        return;
    }
    const newName: Name = { id: crypto.randomUUID(), name };
    const updatedList = { ...selectedList, names: [...selectedList.names, newName] };
    updateList(updatedList);
  }, [selectedList, updateList, toast]);

  const handleImportNames = useCallback((namesString: string) => {
    if (!selectedList) return;
    const names = namesString.split(/[\n,]/).map(n => n.trim()).filter(Boolean);
    const newNames = names
      .filter(name => !selectedList.names.some(existing => existing.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ id: crypto.randomUUID(), name }));
    
    if (newNames.length === 0) {
        toast({ title: "Nenhum nome novo", description: "Todos os nomes importados já estavam na lista." });
        return;
    }

    const updatedList = { ...selectedList, names: [...selectedList.names, ...newNames] };
    updateList(updatedList);
    toast({ title: "Nomes Importados", description: `${newNames.length} novos nomes foram adicionados.` });
  }, [selectedList, updateList, toast]);

  const handleDeleteName = useCallback((nameId: string) => {
    if (!selectedList) return;
    const updatedList = { ...selectedList, names: selectedList.names.filter(n => n.id !== nameId) };
    updateList(updatedList);
  }, [selectedList, updateList]);

  const handleResetList = useCallback(() => {
    if (!selectedList) return;
    const updatedList = { ...selectedList, drawnNames: [] };
    updateList(updatedList);
    toast({ title: "Lista Resetada", description: "O histórico de sorteios 'Modo Justo' foi reiniciado." });
  }, [selectedList, updateList, toast]);

  const handleDraw = useCallback((quantity: number, withReplacement: boolean, fairMode: boolean, dryRun: boolean) => {
    if (!selectedList || selectedList.names.length === 0) {
      toast({ variant: "destructive", title: "Lista Vazia", description: "Adicione nomes à lista antes de sortear." });
      return;
    }

    let pool = [...selectedList.names];
    if (fairMode && !withReplacement) {
        const unDrawnIds = selectedList.names.map(n => n.id).filter(id => !selectedList.drawnNames.includes(id));
        if (unDrawnIds.length < quantity) {
            toast({ title: "Modo Justo: Reiniciando", description: "Todos os nomes foram sorteados. Reiniciando o ciclo." });
            if (!dryRun) {
                const updatedList = { ...selectedList, drawnNames: [] };
                updateList(updatedList);
            }
            pool = [...selectedList.names];
        } else {
            pool = selectedList.names.filter(n => unDrawnIds.includes(n.id));
        }
    }
    
    if (pool.length < quantity && !withReplacement) {
        toast({ variant: "destructive", title: "Nomes Insuficientes", description: `Não há nomes suficientes para sortear ${quantity} sem reposição.` });
        return;
    }

    const drawnNames: Name[] = [];
    let tempPool = [...pool];

    for (let i = 0; i < quantity; i++) {
        if (tempPool.length === 0) break;
        const randomIndex = Math.floor(Math.random() * tempPool.length);
        const winner = tempPool[randomIndex];
        drawnNames.push(winner);
        if (!withReplacement) {
            tempPool.splice(randomIndex, 1);
        }
    }
    
    const result: DrawResult = {
        id: crypto.randomUUID(),
        listId: selectedList.id,
        drawnNames,
        timestamp: new Date(),
        settings: { quantity, withReplacement, fairMode },
    };
    
    setLastResult(result);

    if (!dryRun) {
        setHistory(prev => [result, ...prev]);
        if (fairMode && !withReplacement) {
            const drawnIds = drawnNames.map(n => n.id);
            const updatedList = { ...selectedList, drawnNames: [...new Set([...selectedList.drawnNames, ...drawnIds])] };
            updateList(updatedList);
        }
        toast({ title: "Sorteio Realizado!", description: `${drawnNames.length} nomes foram sorteados.` });
    } else {
        toast({ title: "Simulação de Sorteio", description: "Este resultado não foi salvo." });
    }

  }, [selectedList, updateList, toast]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            <ListManager
              lists={lists}
              selectedList={selectedList}
              onSelectList={setSelectedListId}
              onCreateList={handleCreateList}
              onAddName={handleAddName}
              onImportNames={handleImportNames}
              onDeleteName={handleDeleteName}
              onResetList={handleResetList}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <DrawingPanel list={selectedList} onDraw={handleDraw} />
            
            {lastResult && <DrawingResults result={lastResult} />}

            {selectedList && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Sorteios</CardTitle>
                  <CardDescription>Sorteios realizados para a lista "{selectedList.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                  <DrawingHistory history={listHistory} />
                </CardContent>
              </Card>
            )}
            {!selectedList && (
                <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                    <CardHeader>
                        <CardTitle>Nenhuma lista selecionada</CardTitle>
                        <CardDescription>Crie ou selecione uma lista para ver o painel de sorteio e o histórico.</CardDescription>
                    </CardHeader>
                </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
