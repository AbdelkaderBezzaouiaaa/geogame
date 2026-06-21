export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const BASE_POINTS = 100;
export const SPEED_BONUS = 20;
export const QUESTION_TIME_LIMIT = 15; // seconds
export const TOTAL_QUESTIONS = 10;
