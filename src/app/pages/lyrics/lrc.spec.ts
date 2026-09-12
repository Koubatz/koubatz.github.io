import { describe, expect, it } from 'vitest';
import { isSyncedLyrics, parseLrc } from './lrc';

describe('parseLrc', () => {
  it('reads a timestamp tag as seconds, treating the fraction as centiseconds', () => {
    expect(parseLrc('[00:12.50]Hey')).toEqual([{ time: 12.5, text: 'Hey' }]);
    expect(parseLrc('[01:00.00]Hey')).toEqual([{ time: 60, text: 'Hey' }]);
  });

  it('accepts a tag with no fraction', () => {
    expect(parseLrc('[00:03]Hey')).toEqual([{ time: 3, text: 'Hey' }]);
  });

  it('emits one entry per tag when a line repeats at several times', () => {
    expect(parseLrc('[00:10.00][00:20.00]Chorus')).toEqual([
      { time: 10, text: 'Chorus' },
      { time: 20, text: 'Chorus' },
    ]);
  });

  it('orders entries by time regardless of their order in the source', () => {
    const times = parseLrc('[00:30.00]third\n[00:10.00]first\n[00:20.00]second').map(
      line => line.time
    );

    expect(times).toEqual([10, 20, 30]);
  });

  it('drops lines with no tag and tagged lines with no text', () => {
    expect(parseLrc('plain line with no tag')).toEqual([]);
    expect(parseLrc('[00:05.00]   ')).toEqual([]);
  });
});

describe('isSyncedLyrics', () => {
  it('is true only when at least one line carries a timestamp', () => {
    expect(isSyncedLyrics('[00:01.00]Hey')).toBe(true);
    expect(isSyncedLyrics('Hey\nwithout timestamps')).toBe(false);
    expect(isSyncedLyrics('')).toBe(false);
  });
});
