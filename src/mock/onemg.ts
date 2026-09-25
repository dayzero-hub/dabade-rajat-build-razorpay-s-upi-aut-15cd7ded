// Tata 1mg medicine search — a catalogue with autocomplete suggestions.
//
// Every item carries `prescription`, which is the flag your brief is about: an Rx medicine must
// read as prescription-only wherever it appears. The search is deliberately slow enough that a
// fast typist can outrun it — cancelling a response you no longer want is the work.
import { mockCall } from './client'

export interface Medicine {
  id: string
  name: string
  /** The active ingredient, which is what people search for as often as the brand. */
  composition: string
  manufacturer: string
  priceInr: number
  packLabel: string
  /** true = prescription only (Rx). false = over the counter. */
  prescription: boolean
  inStock: boolean
}

const catalogue: Medicine[] = [
  { id: 'm-01', name: 'Dolo 650',        composition: 'Paracetamol 650mg',            manufacturer: 'Micro Labs',   priceInr: 34,  packLabel: 'strip of 15 tablets', prescription: false, inStock: true },
  { id: 'm-02', name: 'Crocin Advance',  composition: 'Paracetamol 500mg',            manufacturer: 'GSK',          priceInr: 30,  packLabel: 'strip of 15 tablets', prescription: false, inStock: true },
  { id: 'm-03', name: 'Azithral 500',    composition: 'Azithromycin 500mg',           manufacturer: 'Alembic',      priceInr: 118, packLabel: 'strip of 5 tablets',  prescription: true,  inStock: true },
  { id: 'm-04', name: 'Augmentin 625 Duo', composition: 'Amoxycillin + Clavulanic Acid', manufacturer: 'GSK',       priceInr: 224, packLabel: 'strip of 10 tablets', prescription: true,  inStock: false },
  { id: 'm-05', name: 'Pan 40',          composition: 'Pantoprazole 40mg',            manufacturer: 'Alkem',        priceInr: 145, packLabel: 'strip of 15 tablets', prescription: true,  inStock: true },
  { id: 'm-06', name: 'Digene Gel',      composition: 'Antacid suspension',           manufacturer: 'Abbott',       priceInr: 158, packLabel: 'bottle of 200ml',     prescription: false, inStock: true },
  { id: 'm-07', name: 'Cetirizine 10mg', composition: 'Cetirizine 10mg',              manufacturer: 'Cipla',        priceInr: 22,  packLabel: 'strip of 10 tablets', prescription: false, inStock: true },
  { id: 'm-08', name: 'Montair LC',      composition: 'Montelukast + Levocetirizine', manufacturer: 'Cipla',        priceInr: 196, packLabel: 'strip of 10 tablets', prescription: true,  inStock: true },
  { id: 'm-09', name: 'Volini Gel',      composition: 'Diclofenac topical',           manufacturer: 'Sun Pharma',   priceInr: 175, packLabel: 'tube of 50g',         prescription: false, inStock: true },
  { id: 'm-10', name: 'Zincovit',        composition: 'Multivitamin + Zinc',          manufacturer: 'Apex',         priceInr: 108, packLabel: 'strip of 15 tablets', prescription: false, inStock: true },
  { id: 'm-11', name: 'Thyronorm 50mcg', composition: 'Thyroxine 50mcg',              manufacturer: 'Abbott',       priceInr: 162, packLabel: 'bottle of 120 tablets', prescription: true, inStock: true },
  { id: 'm-12', name: 'Metformin 500',   composition: 'Metformin 500mg',              manufacturer: 'USV',          priceInr: 46,  packLabel: 'strip of 20 tablets', prescription: true,  inStock: true },
  { id: 'm-13', name: 'ORS Orange',      composition: 'Oral rehydration salts',       manufacturer: 'FastNHeal',    priceInr: 21,  packLabel: 'sachet of 21g',       prescription: false, inStock: true },
  { id: 'm-14', name: 'Betadine Gargle', composition: 'Povidone Iodine 2%',           manufacturer: 'Win-Medicare', priceInr: 178, packLabel: 'bottle of 100ml',     prescription: false, inStock: false },
  { id: 'm-15', name: 'Shelcal 500',     composition: 'Calcium + Vitamin D3',         manufacturer: 'Torrent',      priceInr: 132, packLabel: 'strip of 15 tablets', prescription: false, inStock: true },
]

export interface Suggestion {
  id: string
  /** What to show in the dropdown. */
  label: string
  prescription: boolean
}

/** Autocomplete. Matches brand OR composition, because people search for both. */
export async function suggest(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const q = query.trim().toLowerCase()
  return mockCall(() => {
    if (q.length < 2) return []
    return catalogue
      .filter(m => m.name.toLowerCase().includes(q) || m.composition.toLowerCase().includes(q))
      .slice(0, 6)
      .map(m => ({ id: m.id, label: m.name, prescription: m.prescription }))
  }, { minLatencyMs: 150, maxLatencyMs: 700 }, signal)
}

/** The full result list for a submitted search. */
export async function search(query: string, signal?: AbortSignal): Promise<Medicine[]> {
  const q = query.trim().toLowerCase()
  return mockCall(() => {
    if (!q) return []
    return catalogue
      .filter(m => m.name.toLowerCase().includes(q) || m.composition.toLowerCase().includes(q))
      .map(m => ({ ...m }))
  }, { minLatencyMs: 400, maxLatencyMs: 1400 }, signal)
}
