"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { metaSchema } from "../data/schema";
import { EditMetaDialog } from "./edit-meta-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  user?: User;
  onRefresh?: () => void;
}

export function DataTableRowActions<TData>({ row, user, onRefresh }: DataTableRowActionsProps<TData>) {
  const meta = metaSchema.parse(row.original);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || !onRefresh) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const url = `/api/metas?userId=${user.uid}&taskId=${meta.id}`;
      
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        onRefresh();
        setDeleteOpen(false);
      }
    } catch (error) {
      console.error("Error deleting meta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            Excluir
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a meta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editOpen && (
        <EditMetaDialog 
          open={editOpen} 
          onOpenChange={setEditOpen} 
          meta={meta} 
          user={user} 
          onRefresh={onRefresh} 
        />
      )}
    </>
  );
}
