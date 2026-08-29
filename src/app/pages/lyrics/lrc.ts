// Parser for the LRC karaoke lyric-timing format, e.g. "[00:12.50]Some line".
// A song is considered "synced" purely based on whether its lyrics text
// contains at least one valid LRC timestamp tag — there is no separate
// stored flag for this.

export interface LrcLine {
  time: number; // seconds, float
  text: string;
}

const LRC_TAG_PATTERN = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

export function parseLrc(raw: string): LrcLine[] {
  const lines: LrcLine[] = [];
  const physicalLines = raw.split(/\r\n|\n/);

  for (const physicalLine of physicalLines) {
    const matches = Array.from(physicalLine.matchAll(LRC_TAG_PATTERN));
    if (!matches.length) {
      continue;
    }

    const text = physicalLine.replace(LRC_TAG_PATTERN, '').trim();
    if (!text) {
      continue;
    }

    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = match[3] ?? '';
      const milliseconds = Number(fraction.padEnd(3, '0').slice(0, 3) || '0');
      const time = minutes * 60 + seconds + milliseconds / 1000;
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function isSyncedLyrics(raw: string): boolean {
  return parseLrc(raw).length > 0;
}
