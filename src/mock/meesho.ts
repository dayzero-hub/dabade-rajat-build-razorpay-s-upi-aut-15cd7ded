// Meesho address capture — a PIN-code lookup.
//
// Three outcomes, all real: one area, several areas for one PIN (the user has to choose), and a
// PIN that is not serviceable at all. Your brief is about the form staying usable through all
// three, including while the lookup is still in flight.
import { mockCall } from './client'

export interface PinArea {
  area: string
  city: string
  state: string
}

export interface PinLookupResult {
  pin: string
  /** Empty means a genuine miss: a valid-looking PIN we do not deliver to. */
  areas: PinArea[]
}

const directory: Record<string, PinArea[]> = {
  '560034': [{ area: 'Koramangala', city: 'Bengaluru', state: 'Karnataka' }],
  '400050': [{ area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra' }],
  '110016': [
    { area: 'Hauz Khas', city: 'New Delhi', state: 'Delhi' },
    { area: 'Green Park Extension', city: 'New Delhi', state: 'Delhi' },
    { area: 'SDA', city: 'New Delhi', state: 'Delhi' },
  ],
  '700019': [
    { area: 'Ballygunge', city: 'Kolkata', state: 'West Bengal' },
    { area: 'Gariahat', city: 'Kolkata', state: 'West Bengal' },
  ],
  '600041': [{ area: 'Thiruvanmiyur', city: 'Chennai', state: 'Tamil Nadu' }],
  '380015': [{ area: 'Satellite', city: 'Ahmedabad', state: 'Gujarat' }],
  '190001': [], // Valid shape, not serviceable. The miss your brief asks you to handle.
}

/**
 * Looks a PIN up. A six-digit PIN this mock has never seen also returns no areas — the miss and
 * the unknown are the same answer to the user, and that is on purpose.
 */
export async function lookupPin(pin: string, signal?: AbortSignal): Promise<PinLookupResult> {
  return mockCall(() => ({
    pin,
    areas: (directory[pin] ?? []).map(a => ({ ...a })),
  }), { minLatencyMs: 350, maxLatencyMs: 1300 }, signal)
}

/** The PINs this mock knows, for while you are building. */
export const knownPins = Object.keys(directory)
