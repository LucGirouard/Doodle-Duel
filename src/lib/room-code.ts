import { ROOM_CODE_LENGTH } from "@/lib/constants";

const ROOM_CODE_REGEX = new RegExp(`^[A-Z]{${ROOM_CODE_LENGTH}}$`);

export function sanitizeRoomCode(value: string) {
  return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(value: string) {
  return ROOM_CODE_REGEX.test(value);
}
