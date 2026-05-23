export const ROUTES = {
  home: "/",
  quickplay: "/quickplay",
  quickplayCreate: "/quickplay/create",
  quickplayJoin: (code: string) => `/quickplay/join/${code}`,
  tinderArt: "/tinderart",
  tinderArtArena: "/tinderart/arena",
} as const;

export const ROOM_CODE_LENGTH = 4;
export const TINDERART_STORAGE_KEY = "tinderart_uploads";
export const TINDERART_MAX_UPLOADS = 10;
export const TINDERART_STARTING_ELO = 1000;
export const TINDERART_ELO_UP = 12;
export const TINDERART_ELO_DOWN = 10;
