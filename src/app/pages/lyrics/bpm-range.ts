// Single source of truth for the valid BPM range across the lyrics feature
// (add-song form validation and the lyrics-player scroll-speed calculation).
//
// scripts/lyrics-server.mjs runs as a plain Node script outside the Angular
// build and cannot import this TypeScript module directly — keep its copy of
// these two numbers in sync with the values below by hand.
export const MIN_VALID_BPM = 30;
export const MAX_VALID_BPM = 300;
