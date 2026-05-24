export const ROUTES = {
  home: "/",
  auth: "/auth",
  quickplay: "/quickplay",
  quickplayCreate: "/quickplay/create",
  rateIt: "/rate-it",
  rateItArena: "/rate-it/arena",
} as const;

export const RATE_IT_STARTING_ELO = 1000;
export const RATE_IT_ELO_UP = 12;
export const RATE_IT_ELO_DOWN = 10;
export const DAILY_DRAW_SECONDS = 120;

export const DAILY_WORD_BANK = [
  "Cat",
  "Fish",
  "Tree",
  "Gem",
  "Dragon",
  "Ocean",
  "Forest",
] as const;