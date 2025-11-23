import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic read/write
async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    // If file doesn't exist or is invalid, write default and return it
    await writeJson(filename, defaultValue);
    return defaultValue;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Exchanges ---
export interface ExchangeSymbol {
  id: string;
  symbol: string;
  category: string;
}

const DEFAULT_EXCHANGES: ExchangeSymbol[] = [
  { id: "def1", symbol: "BMFBOVESPA:IBOV", category: "Índices" },
  { id: "def2", symbol: "BMFBOVESPA:SMLL", category: "Índices" },
  { id: "def3", symbol: "SP:SPX", category: "Índices" },
  { id: "def4", symbol: "TVC:DXY", category: "Índices" },
  { id: "def5", symbol: "DJ:DJI", category: "Índices" },
  { id: "def6", symbol: "BMFBOVESPA:PETR4", category: "Ações" },
  { id: "def7", symbol: "BMFBOVESPA:ITSA4", category: "Ações" },
  { id: "def8", symbol: "BMFBOVESPA:VALE3", category: "Ações" },
  { id: "def9", symbol: "BMFBOVESPA:MGLU3", category: "Ações" },
  { id: "def10", symbol: "CRYPTO:BTCUSD", category: "Cripto" },
  { id: "def11", symbol: "CRYPTO:ETHUSD", category: "Cripto" },
];

export const exchangesDb = {
  getAll: () => readJson<ExchangeSymbol[]>('exchanges.json', DEFAULT_EXCHANGES),
  saveAll: (data: ExchangeSymbol[]) => writeJson('exchanges.json', data),
};

// --- News Sources ---
export interface NewsSource {
  id: string;
  name: string;
  url: string;
}

const DEFAULT_NEWS_SOURCES: NewsSource[] = [
  {
    id: "def1",
    name: "Google News (Padrão)",
    url: "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419&topic=B",
  },
];

export const newsSourcesDb = {
  getAll: () => readJson<NewsSource[]>('news_sources.json', DEFAULT_NEWS_SOURCES),
  saveAll: (data: NewsSource[]) => writeJson('news_sources.json', data),
};

// --- Game Stocks ---
export interface GameStock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change?: number;
  owned?: number;
  history?: { time: string; price: number }[];
}

const DEFAULT_GAME_STOCKS: GameStock[] = [
  { id: "def1", name: "TechCorp", symbol: "TECH", price: 150, change: 0, owned: 0, history: [{ time: "0", price: 150 }] },
  { id: "def2", name: "BioMed Inc", symbol: "BIOM", price: 85, change: 0, owned: 0, history: [{ time: "0", price: 85 }] },
  { id: "def3", name: "EnergyPlus", symbol: "ENGY", price: 120, change: 0, owned: 0, history: [{ time: "0", price: 120 }] },
  { id: "def4", name: "RetailMax", symbol: "RETL", price: 60, change: 0, owned: 0, history: [{ time: "0", price: 60 }] },
  { id: "def5", name: "FinanceHub", symbol: "FINH", price: 200, change: 0, owned: 0, history: [{ time: "0", price: 200 }] },
  { id: "def6", name: "AutoDrive", symbol: "AUTO", price: 95, change: 0, owned: 0, history: [{ time: "0", price: 95 }] },
];

export const gameStocksDb = {
  getAll: () => readJson<GameStock[]>('game_stocks.json', DEFAULT_GAME_STOCKS),
  saveAll: (data: GameStock[]) => writeJson('game_stocks.json', data),
};

// --- Dashboard Currencies ---
export interface DashboardCurrency {
  id: string;
  pair: string; // e.g. "USD-BRL"
  name: string; // e.g. "Dólar"
}

const DEFAULT_DASHBOARD_CURRENCIES: DashboardCurrency[] = [
  { id: "def1", pair: "BTC-BRL", name: "Bitcoin" },
  { id: "def2", pair: "USD-BRL", name: "Dólar" },
  { id: "def3", pair: "EUR-BRL", name: "Euro" },
  { id: "def4", pair: "XAU-BRL", name: "Ouro" },
];

export const dashboardCurrenciesDb = {
  getAll: () => readJson<DashboardCurrency[]>('dashboard_currencies.json', DEFAULT_DASHBOARD_CURRENCIES),
  saveAll: (data: DashboardCurrency[]) => writeJson('dashboard_currencies.json', data),
};
