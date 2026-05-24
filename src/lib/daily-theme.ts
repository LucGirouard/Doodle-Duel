import { DAILY_WORD_BANK } from "@/lib/constants";
import { getLocalDayKey } from "@/lib/day";

export function getDailyTheme(date = new Date()): string {
  const key = getLocalDayKey(date);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return DAILY_WORD_BANK[hash % DAILY_WORD_BANK.length];
}