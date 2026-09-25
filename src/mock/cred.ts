// CRED statement view — a month of card transactions.
//
// Seeded on purpose: genuine duplicates (the same merchant, amount and day, which are NOT a bug)
// and fees. Telling a real duplicate charge from two honest identical purchases is the judgement
// your brief is about, so both shapes are in here.
import { mockCall } from './client'

export type TxnKind = 'purchase' | 'fee' | 'refund' | 'payment'

export interface Transaction {
  id: string
  /** ISO timestamp. */
  at: string
  merchant: string
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Fuel' | 'Card'
  /** Rupees. Positive is charged to the card; negative is credited back. */
  amountInr: number
  kind: TxnKind
}

const txns: Transaction[] = [
  { id: 't-01', at: '2026-08-02T09:12:00+05:30', merchant: 'Blue Tokai Coffee',   category: 'Food',     amountInr: 420,   kind: 'purchase' },
  { id: 't-02', at: '2026-08-02T09:14:00+05:30', merchant: 'Blue Tokai Coffee',   category: 'Food',     amountInr: 420,   kind: 'purchase' },
  { id: 't-03', at: '2026-08-03T20:41:00+05:30', merchant: 'Swiggy',              category: 'Food',     amountInr: 638,   kind: 'purchase' },
  { id: 't-04', at: '2026-08-05T11:02:00+05:30', merchant: 'IndiGo',              category: 'Travel',   amountInr: 7840,  kind: 'purchase' },
  { id: 't-05', at: '2026-08-06T08:30:00+05:30', merchant: 'Indian Oil',          category: 'Fuel',     amountInr: 2500,  kind: 'purchase' },
  { id: 't-06', at: '2026-08-07T15:22:00+05:30', merchant: 'Amazon',              category: 'Shopping', amountInr: 1299,  kind: 'purchase' },
  { id: 't-07', at: '2026-08-08T15:24:00+05:30', merchant: 'Amazon',              category: 'Shopping', amountInr: 1299,  kind: 'purchase' },
  { id: 't-08', at: '2026-08-09T10:00:00+05:30', merchant: 'Late payment fee',    category: 'Card',     amountInr: 750,   kind: 'fee' },
  { id: 't-09', at: '2026-08-09T10:00:00+05:30', merchant: 'GST on fee',          category: 'Card',     amountInr: 135,   kind: 'fee' },
  { id: 't-10', at: '2026-08-11T19:05:00+05:30', merchant: 'BookMyShow',          category: 'Shopping', amountInr: 980,   kind: 'purchase' },
  { id: 't-11', at: '2026-08-12T13:47:00+05:30', merchant: 'Uber',                category: 'Travel',   amountInr: 317,   kind: 'purchase' },
  { id: 't-12', at: '2026-08-12T13:47:00+05:30', merchant: 'Uber',                category: 'Travel',   amountInr: 317,   kind: 'purchase' },
  { id: 't-13', at: '2026-08-14T21:10:00+05:30', merchant: 'Zomato',              category: 'Food',     amountInr: 545,   kind: 'purchase' },
  { id: 't-14', at: '2026-08-16T17:33:00+05:30', merchant: 'Croma',               category: 'Shopping', amountInr: 24990, kind: 'purchase' },
  { id: 't-15', at: '2026-08-17T12:00:00+05:30', merchant: 'Croma',               category: 'Shopping', amountInr: -24990, kind: 'refund' },
  { id: 't-16', at: '2026-08-18T09:20:00+05:30', merchant: 'Airtel Postpaid',     category: 'Bills',    amountInr: 1099,  kind: 'purchase' },
  { id: 't-17', at: '2026-08-19T22:15:00+05:30', merchant: 'Swiggy Instamart',    category: 'Food',     amountInr: 872,   kind: 'purchase' },
  { id: 't-18', at: '2026-08-21T08:05:00+05:30', merchant: 'Foreign txn fee',     category: 'Card',     amountInr: 210,   kind: 'fee' },
  { id: 't-19', at: '2026-08-22T18:44:00+05:30', merchant: 'Nykaa',               category: 'Shopping', amountInr: 2145,  kind: 'purchase' },
  { id: 't-20', at: '2026-08-24T07:55:00+05:30', merchant: 'Rapido',              category: 'Travel',   amountInr: 96,    kind: 'purchase' },
  { id: 't-21', at: '2026-08-25T14:30:00+05:30', merchant: 'Apollo Pharmacy',     category: 'Bills',    amountInr: 1440,  kind: 'purchase' },
  { id: 't-22', at: '2026-08-27T11:11:00+05:30', merchant: 'Payment received',    category: 'Card',     amountInr: -15000, kind: 'payment' },
  { id: 't-23', at: '2026-08-28T20:02:00+05:30', merchant: 'Zepto',               category: 'Food',     amountInr: 634,   kind: 'purchase' },
  { id: 't-24', at: '2026-08-29T13:26:00+05:30', merchant: 'Decathlon',           category: 'Shopping', amountInr: 3299,  kind: 'purchase' },
  { id: 't-25', at: '2026-08-30T09:40:00+05:30', merchant: 'Indian Oil',          category: 'Fuel',     amountInr: 2000,  kind: 'purchase' },
]

export interface Statement {
  /** "YYYY-MM" — the billing month these transactions belong to. */
  month: string
  totalDueInr: number
  transactions: Transaction[]
}

export async function getStatement(month = '2026-08', signal?: AbortSignal): Promise<Statement> {
  return mockCall(() => ({
    month,
    totalDueInr: txns.reduce((sum, t) => sum + t.amountInr, 0),
    transactions: txns.map(t => ({ ...t })),
  }), { minLatencyMs: 400, maxLatencyMs: 1100 }, signal)
}
