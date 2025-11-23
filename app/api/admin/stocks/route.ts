import { NextResponse } from "next/server";
import { gameStocksDb, GameStock } from "@/lib/local-db";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const data = await gameStocksDb.getAll();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const current = await gameStocksDb.getAll();
  
  if (body.id) {
    const updated = current.map(item => item.id === body.id ? { ...item, ...body } : item);
    await gameStocksDb.saveAll(updated);
    return NextResponse.json({ success: true });
  }
  
  const newItem: GameStock = {
    id: uuidv4(),
    change: 0,
    owned: 0,
    history: [{ time: "0", price: Number(body.price) }],
    ...body
  };
  await gameStocksDb.saveAll([...current, newItem]);
  return NextResponse.json(newItem);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
  const current = await gameStocksDb.getAll();
  const filtered = current.filter(item => item.id !== id);
  await gameStocksDb.saveAll(filtered);
  
  return NextResponse.json({ success: true });
}
