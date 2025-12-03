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

import { taskDisplaySchema } from "../data/schema";
import { EditTaskDialog } from "./edit-task-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  user?: User;
  onRefresh?: () => void;
}

export function DataTableRowActions<TData>({ row, user, onRefresh }: DataTableRowActionsProps<TData>) {
  const task = taskDisplaySchema.parse(row.original);
  
  const currentUser = user;
  const currentOnRefresh = onRefresh;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // console.log('Row actions meta:', { hasUser: !!currentUser, hasRefresh: !!currentOnRefresh, taskId: task.id });

  const handleToggleStatus = async () => {
    if (!currentUser || !currentOnRefresh) return;
    
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const newStatus = task.status === "done";
      
      await fetch(`/api/tasks?userId=${currentUser.uid}&taskId=${task.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: !newStatus })
      });
      
      currentOnRefresh();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !currentOnRefresh) {
      console.log('Missing context:', { hasUser: !!currentUser, hasRefresh: !!currentOnRefresh });
      return;
    }
    
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const url = `/api/tasks?userId=${currentUser.uid}&taskId=${task.id}`;
      
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        currentOnRefresh();
        setDeleteOpen(false);
      } else {
        console.error('Delete failed with status:', res.status);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="data-[state=open]:bg-muted size-8">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleToggleStatus} disabled={loading}>
            {task.status === "done" ? "Mark as Todo" : "Mark as Done"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)} disabled={loading}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentUser && currentOnRefresh && (
        <EditTaskDialog 
          open={editOpen}
          onOpenChange={setEditOpen}
          user={currentUser} 
          task={task} 
          onSuccess={currentOnRefresh} 
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
