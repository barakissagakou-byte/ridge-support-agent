// Long-term memory kept in the browser's localStorage.

export type Ticket = {
  id: string;
  category: string;
  priority: string;
  summary: string;
  createdAt: string;
};

const FACTS_KEY = 'ridge.facts';
const TICKETS_KEY = 'ridge.tickets';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota): memory just won't persist.
  }
}

export const loadFacts = (): string[] => {
  const v = read<unknown>(FACTS_KEY, []);
  return Array.isArray(v) ? v.filter((f): f is string => typeof f === 'string') : [];
};
export const saveFacts = (facts: string[]) => write(FACTS_KEY, facts);

export const loadTickets = (): Ticket[] => {
  const v = read<unknown>(TICKETS_KEY, []);
  return Array.isArray(v) ? (v as Ticket[]) : [];
};
export const saveTickets = (tickets: Ticket[]) => write(TICKETS_KEY, tickets);
