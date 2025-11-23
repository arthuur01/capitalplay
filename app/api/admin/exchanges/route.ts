import { NextResponse } from "next/server";
import { exchangesDb, ExchangeSymbol } from "@/lib/local-db";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const data = await exchangesDb.getAll();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const current = await exchangesDb.getAll();
  
  // If body has id, it's an update
  if (body.id) {
    const updated = current.map(item => item.id === body.id ? { ...item, ...body } : item);
    await exchangesDb.saveAll(updated);
    return NextResponse.json({ success: true });
  }
  
  // Else it's a new item
  const newItem: ExchangeSymbol = {
    id: uuidv4(),
    ...body
  };
  await exchangesDb.saveAll([...current, newItem]);
  return NextResponse.json(newItem);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
  const current = await exchangesDb.getAll();
  const filtered = current.filter(item => item.id !== id);
  await exchangesDb.saveAll(filtered);
  
  return NextResponse.json({ success: true });
}
