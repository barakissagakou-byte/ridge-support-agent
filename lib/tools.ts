import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { ORDERS, POLICIES, PRODUCTS, TICKET_ROUTING } from './data';

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

export const TICKET_CATEGORIES = ['Billing', 'Shipping', 'Product Defect', 'Return', 'Other'] as const;
export const TICKET_PRIORITIES = ['Low', 'Normal', 'High'] as const;

export const tools = {
  lookup_order: tool({
    description:
      'Look up an order. Requires BOTH the order number and the last name on the order. Returns the order only if both match.',
    inputSchema: z.object({
      order_number: z.string().describe('Order number, e.g. A1001'),
      last_name: z.string().describe("Last name on the order, as given by the customer"),
    }),
    execute: async ({ order_number, last_name }) => {
      const num = order_number.trim().toUpperCase();
      const last = normalize(last_name);
      const order = ORDERS.find(
        (o) =>
          o.orderNumber === num &&
          normalize(o.customerName.split(' ').slice(-1)[0]) === last,
      );
      // Same response for "no such order" and "wrong name" so nothing leaks.
      if (!order) {
        return {
          found: false,
          message: 'No order matches that order number and last name. Share no order details.',
        };
      }
      return {
        found: true,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        items: order.items.map((i) => `${i.name} ($${i.price})`),
        total: `$${order.items.reduce((sum, i) => sum + i.price, 0)}`,
        status: order.status,
        notes: order.notes ?? 'None',
      };
    },
  }),

  search_policy: tool({
    description: 'Search store policies (returns, warranty, shipping, billing, price match, discounts).',
    inputSchema: z.object({
      topic: z.string().describe('What the policy question is about'),
    }),
    execute: async ({ topic }) => {
      const q = normalize(topic);
      const words = new Set(q.split(' '));
      const scored = POLICIES.map((p) => {
        let score = normalize(p.topic) === q ? 10 : 0;
        for (const k of p.keywords) {
          if (k.includes(' ') ? q.includes(k) : words.has(k)) score += k.includes(' ') ? 3 : 2;
          else if (q.includes(k)) score += 1;
        }
        return { p, score };
      }).sort((a, b) => b.score - a.score);

      if (scored[0].score === 0) {
        return {
          found: false,
          message: 'No matching policy.',
          available_topics: POLICIES.map((p) => p.topic),
        };
      }
      return { found: true, topic: scored[0].p.topic, policy: scored[0].p.text };
    },
  }),

  get_product_info: tool({
    description: 'Get price, stock status, and known issues for a product.',
    inputSchema: z.object({
      product_name: z.string().describe('Product name, e.g. "Summit 40L Backpack" or "backpack"'),
    }),
    execute: async ({ product_name }) => {
      const q = normalize(product_name);
      const qWords = q.split(' ').filter((w) => w.length > 2);
      const scored = PRODUCTS.map((p) => {
        const name = normalize(p.name);
        const score = name === q ? 100 : qWords.filter((w) => name.includes(w)).length;
        return { p, score };
      }).sort((a, b) => b.score - a.score);

      if (scored[0].score === 0) {
        return {
          found: false,
          message: 'No product by that name.',
          catalog: PRODUCTS.map((p) => p.name),
        };
      }
      const { p } = scored[0];
      return {
        found: true,
        name: p.name,
        price: `$${p.price}`,
        stock: p.stock,
        known_issues: p.knownIssues,
      };
    },
  }),

  create_ticket: tool({
    description:
      'Open a support ticket for the right team. Use for refunds, credits, billing problems, lost shipments, defects, returns, requests for a human, or upset customers (High priority).',
    inputSchema: z.object({
      customer_name: z.string().describe('Customer name, or "Unknown" if not given'),
      order_number: z.string().optional().describe('Related order number, if any'),
      category: z.enum(TICKET_CATEGORIES),
      priority: z.enum(TICKET_PRIORITIES),
      summary: z.string().describe('One-sentence summary of the issue'),
    }),
    execute: async ({ customer_name, order_number, category, priority, summary }) => {
      const id = `T-${Math.floor(1000 + Math.random() * 9000)}`;
      const route = TICKET_ROUTING[category];
      return {
        ticket_id: id,
        customer_name,
        order_number: order_number ?? null,
        category,
        priority,
        summary,
        team: route.team,
        timeframe: route.timeframe,
      };
    },
  }),

  remember_customer: tool({
    description:
      'Save one short, useful fact about the customer (name, order number, an open issue, a preference) so Ridge remembers it next time.',
    inputSchema: z.object({
      fact: z.string().max(200).describe('One short fact, e.g. "Name is Priya Shah"'),
    }),
    // The browser stores the fact in localStorage when it sees this result.
    execute: async ({ fact }) => ({ saved: true, fact: fact.trim() }),
  }),
};
