import { NextResponse } from "next/server";
import { dashboardCurrenciesDb, DashboardCurrency } from "@/lib/local-db";
import { randomUUID } from "crypto";

export async function GET() {
  const data = await dashboardCurrenciesDb.getAll();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const current = await dashboardCurrenciesDb.getAll();
  
  if (body.id) {
    const updated = current.map(item => item.id === body.id ? { ...item, ...body } : item);
    await dashboardCurrenciesDb.saveAll(updated);
    return NextResponse.json({ success: true });
  }
  
  const newItem: DashboardCurrency = {
    id: randomUUID(),
    ...body
  };
  await dashboardCurrenciesDb.saveAll([...current, newItem]);
  return NextResponse.json(newItem);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
  const current = await dashboardCurrenciesDb.getAll();
  const filtered = current.filter(item => item.id !== id);
  await dashboardCurrenciesDb.saveAll(filtered);
  
  return NextResponse.json({ success: true });
}
