"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddMetaDialog } from "./add-meta-dialog";
import { DataTableContext } from "./data-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  
  // Access user and onRefresh from table meta
  const meta = table.options.meta as DataTableContext | undefined;
  const user = meta?.user;
  const onRefresh = meta?.onRefresh;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar metas..."
          value={(table.getColumn("Titulo")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("Titulo")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {user && onRefresh && (
        <AddMetaDialog user={user} onSuccess={onRefresh} />
      )}
    </div>
  );
}
