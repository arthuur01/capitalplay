"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Meta } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { User } from "firebase/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const getColumns = (user?: User, onRefresh?: () => void): ColumnDef<Meta>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("Status") as boolean;
      const meta = row.original;
      
      const toggleStatus = async () => {
        if (!user || !onRefresh) return;
        try {
          const token = await user.getIdToken();
          await fetch(`/api/metas?userId=${user.uid}&taskId=${meta.id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ Status: !status })
          });
          onRefresh();
        } catch (error) {
          console.error("Error toggling status:", error);
        }
      };

      return (
        <div 
          className={`h-5 w-5 rounded-full border-2 cursor-pointer transition-colors ${status ? 'bg-green-500 border-green-500' : 'border-muted-foreground hover:border-primary'}`}
          onClick={toggleStatus}
          title={status ? "Concluído" : "Marcar como concluído"}
        />
      );
    },
  },
  {
    accessorKey: "Titulo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("Titulo")}</div>,
  },
  {
    accessorKey: "Valor_meta",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valor Meta" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("Valor_meta"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "Data_inicial",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data Inicial" />,
    cell: ({ row }) => {
      const dateStr = row.getValue("Data_inicial") as string;
      if (!dateStr) return <span>-</span>;
      return <span>{format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR })}</span>;
    },
  },
  {
    accessorKey: "Data_final",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data Final" />,
    cell: ({ row }) => {
      const dateStr = row.getValue("Data_final") as string;
      if (!dateStr) return <span>-</span>;
      return <span>{format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR })}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} user={user} onRefresh={onRefresh} />
  }
];
