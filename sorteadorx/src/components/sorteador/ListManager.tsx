"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Upload, Trash2, List, Users, RotateCcw } from 'lucide-react';
import type { List as ListType } from '@/types';

interface ListManagerProps {
  lists: ListType[];
  selectedList: ListType | undefined;
  onSelectList: (id: string) => void;
  onCreateList: (name: string, description: string) => void;
  onAddName: (name: string) => void;
  onImportNames: (names: string) => void;
  onDeleteName: (id: string) => void;
  onResetList: () => void;
}

export function ListManager({ lists, selectedList, onSelectList, onCreateList, onAddName, onImportNames, onDeleteName, onResetList }: ListManagerProps) {
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newSingleName, setNewSingleName] = useState('');
  const [importedNames, setImportedNames] = useState('');

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName, newListDesc);
    setNewListName('');
    setNewListDesc('');
  };

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSingleName.trim()) return;
    onAddName(newSingleName);
    setNewSingleName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><List className="mr-2 h-6 w-6" />Gerenciar Listas</CardTitle>
        <CardDescription>Crie, selecione e adicione nomes às suas listas de sorteio.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="select">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Selecionar</TabsTrigger>
            <TabsTrigger value="create">Criar Nova</TabsTrigger>
          </TabsList>
          <TabsContent value="select" className="pt-4">
            <Select onValueChange={onSelectList} value={selectedList?.id || ''} disabled={lists.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma lista..." />
              </SelectTrigger>
              <SelectContent>
                {lists.map(list => (
                  <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lists.length === 0 && <p className="text-sm text-muted-foreground mt-2 text-center">Nenhuma lista encontrada. Crie uma na aba ao lado.</p>}
          </TabsContent>
          <TabsContent value="create" className="pt-4">
            <form onSubmit={handleCreateList} className="space-y-4">
              <Input placeholder="Nome da lista" value={newListName} onChange={(e) => setNewListName(e.target.value)} required />
              <Textarea placeholder="Descrição (opcional)" value={newListDesc} onChange={(e) => setNewListDesc(e.target.value)} />
              <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Criar Lista</Button>
            </form>
          </TabsContent>
        </Tabs>

        {selectedList && (
          <>
            <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold flex items-center mb-4"><Users className="mr-2 h-5 w-5" />Nomes na Lista ({selectedList.names.length})</h3>
                <ScrollArea className="h-48 w-full rounded-md border p-2">
                    {selectedList.names.length > 0 ? (
                        <ul className="space-y-1">
                        {selectedList.names.map(name => (
                            <li key={name.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                            <span>{name.name}</span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover "{name.name}" da lista?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteName(name.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum nome na lista.</p>
                    )}
                </ScrollArea>
                <div className="mt-2 text-right">
                    <Button onClick={onResetList} variant="link" size="sm" className="text-muted-foreground">
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Resetar 'Modo Justo' ({selectedList.drawnNames.length} sorteados)
                    </Button>
                </div>
            </div>

            <div className="mt-4 space-y-4">
                <form onSubmit={handleAddName} className="flex gap-2">
                    <Input placeholder="Adicionar um nome" value={newSingleName} onChange={(e) => setNewSingleName(e.target.value)} />
                    <Button type="submit" size="icon" variant="outline"><PlusCircle className="h-4 w-4" /></Button>
                </form>

                <div>
                    <Label htmlFor="import">Importar nomes (separados por vírgula ou linha)</Label>
                    <Textarea id="import" placeholder="João, Maria, José..." value={importedNames} onChange={(e) => setImportedNames(e.target.value)} className="mt-1" />
                    <Button onClick={() => { onImportNames(importedNames); setImportedNames(''); }} className="w-full mt-2" variant="secondary"><Upload className="mr-2 h-4 w-4" />Importar Nomes</Button>
                </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
