import 'server-only';

// Fictional store data for Allegheny Gear Co. Today's date is September 23, 2026.
export const TODAY = 'September 23, 2026';

export type Order = {
  orderNumber: string;
  customerName: string;
  items: { name: string; price: number }[];
  status: string;
  notes?: string;
};

export const ORDERS: Order[] = [
  {
    orderNumber: 'A1001',
    customerName: 'Priya Shah',
    items: [{ name: 'Summit 40L Backpack', price: 149 }],
    status: 'Delivered Aug 28, 2026',
  },
  {
    orderNumber: 'A1002',
    customerName: 'Marcus Lee',
    items: [{ name: 'Basecamp 2P Tent', price: 329 }],
    status: 'Shipped Sep 12, 2026; in transit',
    notes: 'No tracking update since Sep 14, 2026',
  },
  {
    orderNumber: 'A1003',
    customerName: 'Dana Kowalski',
    items: [{ name: 'Trailhead Rain Jacket', price: 189 }],
    status: 'Delivered Jul 30, 2026',
    notes: 'Card was charged twice ($189 x 2)',
  },
  {
    orderNumber: 'A1004',
    customerName: 'Sam Rivera',
    items: [
      { name: 'Ember Camp Stove', price: 69 },
      { name: 'Ridge Trekking Poles', price: 89 },
    ],
    status: 'Processing; ships Sep 25, 2026',
  },
  {
    orderNumber: 'A1005',
    customerName: 'Jordan Blake',
    items: [{ name: 'Northstar Sleeping Bag', price: 259 }],
    status: 'Delivered Sep 18, 2026',
  },
];

export type Product = {
  name: string;
  price: number;
  stock: string;
  knownIssues: string;
};

export const PRODUCTS: Product[] = [
  {
    name: 'Summit 40L Backpack',
    price: 149,
    stock: 'In stock',
    knownIssues:
      'Main zipper failures on units sold after June 1, 2026. Free replacement under warranty.',
  },
  { name: 'Trailhead Rain Jacket', price: 189, stock: 'In stock', knownIssues: 'None' },
  { name: 'Basecamp 2P Tent', price: 329, stock: 'Low stock', knownIssues: 'None' },
  { name: 'Ridge Trekking Poles', price: 89, stock: 'In stock', knownIssues: 'None' },
  { name: 'Ember Camp Stove', price: 69, stock: 'In stock', knownIssues: 'None' },
  {
    name: 'Northstar Sleeping Bag',
    price: 259,
    stock: 'Out of stock until October 15',
    knownIssues: 'None',
  },
];

export type Policy = { topic: string; keywords: string[]; text: string };

export const POLICIES: Policy[] = [
  {
    topic: 'Returns',
    keywords: ['return', 'returns', 'refund', 'send back', 'exchange', 'unused', 'money back'],
    text: 'Returns are accepted within 30 days of delivery for unused items. Refunds go to the original payment method within 5 to 7 business days after the item arrives. Handled by the Returns team.',
  },
  {
    topic: 'Warranty',
    keywords: ['warranty', 'defect', 'defective', 'broken', 'broke', 'repair', 'replacement', 'replace', 'zipper', 'damaged', 'faulty'],
    text: 'Warranty: 1 year against manufacturing defects; free repair or replacement. Handled by the Quality team, which responds within 24 hours.',
  },
  {
    topic: 'Shipping',
    keywords: ['shipping', 'ship', 'delivery', 'deliver', 'tracking', 'track', 'lost', 'late', 'transit', 'package', 'where is my order'],
    text: 'Standard shipping takes 5 to 7 business days. If tracking has not updated in 7 or more days, open a Shipping ticket; the Logistics team traces the package within 24 hours and reships it if it is lost.',
  },
  {
    topic: 'Billing',
    keywords: ['billing', 'bill', 'charge', 'charged', 'twice', 'double', 'duplicate', 'incorrect', 'payment', 'card', 'overcharged'],
    text: 'Duplicate or incorrect charges go to the Finance team. Confirmed duplicates are refunded within 5 to 7 business days.',
  },
  {
    topic: 'Price match',
    keywords: ['price match', 'price drop', 'cheaper', 'lower price', 'price', 'difference', 'sale'],
    text: 'Price match: if our own price drops within 14 days of purchase, the Finance team refunds the difference.',
  },
  {
    topic: 'Discounts',
    keywords: ['discount', 'coupon', 'promo', 'code', 'voucher', 'deal', 'store credit'],
    text: 'Support agents cannot create discount codes.',
  },
];

// Which team owns each ticket category, and how long they take.
export const TICKET_ROUTING: Record<
  'Billing' | 'Shipping' | 'Product Defect' | 'Return' | 'Other',
  { team: string; timeframe: string }
> = {
  Billing: {
    team: 'Finance team',
    timeframe: 'Confirmed duplicate charges are refunded within 5 to 7 business days',
  },
  Shipping: {
    team: 'Logistics team',
    timeframe: 'Traces the package within 24 hours and reships it if lost',
  },
  'Product Defect': {
    team: 'Quality team',
    timeframe: 'Responds within 24 hours (free repair or replacement under warranty)',
  },
  Return: {
    team: 'Returns team',
    timeframe: 'Refund to the original payment method within 5 to 7 business days after the item arrives',
  },
  Other: {
    team: 'Customer Care team',
    timeframe: 'A team member will follow up by email',
  },
};
