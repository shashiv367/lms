export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Meetings';

export const REACTION_EMOJIS = ['👍', '👏', '❤️', '😂', '🎉', '🔥', '😮'] as const;
