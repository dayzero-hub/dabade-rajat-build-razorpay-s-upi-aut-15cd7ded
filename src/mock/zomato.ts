// Zomato Shorts — a paginated feed of food reels.
//
// The clips are real MP4 files in `public/clips/`, served by Vite from `/clips/…`, so the feed
// plays with no network and nothing to sign up for. They are three-second solid colours: you are
// building playback behaviour, not watching food videos, and a 3KB clip makes it obvious when a
// player is left running off screen.
import { mockCall } from './client'

export interface Reel {
  id: string
  /** Served from `public/`. Use it as-is in a <video src>. */
  videoUrl: string
  dish: string
  restaurant: string
  locality: string
  priceInr: number
  /** Seconds. Every sample clip is the same length. */
  durationSec: number
}

export interface FeedPage {
  reels: Reel[]
  /** Pass back to `getFeed` for the next page. null means the end of the feed. */
  nextCursor: string | null
}

const dishes: Array<Omit<Reel, 'id' | 'videoUrl' | 'durationSec'>> = [
  { dish: 'Paneer Tikka',        restaurant: 'Punjabi Rasoi',      locality: 'Rajouri Garden, Delhi',  priceInr: 320 },
  { dish: 'Masala Dosa',         restaurant: 'CTR',                locality: 'Malleshwaram, Bengaluru', priceInr: 140 },
  { dish: 'Hyderabadi Biryani',  restaurant: 'Shah Ghouse',        locality: 'Tolichowki, Hyderabad',  priceInr: 380 },
  { dish: 'Pav Bhaji',           restaurant: 'Sardar',             locality: 'Tardeo, Mumbai',         priceInr: 260 },
  { dish: 'Filter Coffee',       restaurant: 'Kumbakonam Degree',  locality: 'Mylapore, Chennai',      priceInr: 60  },
  { dish: 'Gulab Jamun',         restaurant: 'Bikanervala',        locality: 'Sector 18, Noida',       priceInr: 180 },
  { dish: 'Chole Bhature',       restaurant: 'Sita Ram Diwan Chand', locality: 'Paharganj, Delhi',     priceInr: 150 },
  { dish: 'Vada Pav',            restaurant: 'Ashok',              locality: 'Dadar, Mumbai',          priceInr: 40  },
  { dish: 'Kosha Mangsho',       restaurant: 'Golbari',            locality: 'Shyambazar, Kolkata',    priceInr: 420 },
  { dish: 'Butter Chicken',      restaurant: 'Moti Mahal',         locality: 'Daryaganj, Delhi',       priceInr: 460 },
  { dish: 'Misal Pav',           restaurant: 'Shree Upahar',       locality: 'Kothrud, Pune',          priceInr: 120 },
  { dish: 'Kerala Parotta',      restaurant: 'Rahmath',            locality: 'Fort Kochi, Kochi',      priceInr: 90  },
]

// Six clips, reused across twelve reels. That is deliberate: a feed whose items share a source
// still needs a player per item, and reusing them keeps the repository small.
const reels: Reel[] = dishes.map((d, i) => ({
  ...d,
  id: `reel-${String(i + 1).padStart(2, '0')}`,
  videoUrl: `/clips/clip-0${(i % 6) + 1}.mp4`,
  durationSec: 3,
}))

const PAGE_SIZE = 4

/** One page of the feed. `cursor` is null for the first page. */
export async function getFeed(cursor: string | null = null, signal?: AbortSignal): Promise<FeedPage> {
  return mockCall(() => {
    const start = cursor ? Number(cursor) : 0
    const slice = reels.slice(start, start + PAGE_SIZE).map(r => ({ ...r }))
    const next = start + PAGE_SIZE
    return { reels: slice, nextCursor: next < reels.length ? String(next) : null }
  }, { minLatencyMs: 350, maxLatencyMs: 1000 }, signal)
}
