export const ROUTES = {
  home: "/",
  quickplay: "/quickplay",
  quickplayCreate: "/quickplay/create",
  quickplayJoin: (code: string) => `/quickplay/join/${code}`,
} as const;

export const ROOM_CODE_LENGTH = 4;
