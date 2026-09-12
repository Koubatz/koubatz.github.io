import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LyricsApiService } from '../lyrics/lyrics-api.service';
import { Song } from '../lyrics/song.model';
import { LyricsPlayerComponent } from './lyrics-player.component';

const SYNCED_SONG: Song = {
  id: 'synced',
  title: 'Synced',
  artist: 'Someone',
  lyrics: '[00:01.00]first line\n[00:02.00]second line',
};

const PLAIN_SONG: Song = {
  id: 'plain',
  title: 'Plain',
  artist: 'Someone',
  lyrics: 'a line\nanother line',
};

async function renderPlayer(song: Song): Promise<ComponentFixture<LyricsPlayerComponent>> {
  await TestBed.configureTestingModule({
    imports: [LyricsPlayerComponent],
    providers: [
      provideRouter([]),
      { provide: LyricsApiService, useValue: { getSongs: () => of([song]) } },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: new Map([['id', song.id]]) } },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(LyricsPlayerComponent);
  fixture.detectChanges();
  return fixture;
}

/** jsdom does not implement Element.scrollTo, so it has to be stubbed to be observed. */
function stubScrollTo(fixture: ComponentFixture<LyricsPlayerComponent>) {
  const container = (fixture.nativeElement as HTMLElement).querySelector(
    '.lyrics-scroll'
  ) as HTMLElement;
  const scrollTo = vi.fn();
  container.scrollTo = scrollTo;
  return scrollTo;
}

describe('LyricsPlayerComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('rewinds the view to the top when restarting a synced song', async () => {
    const fixture = await renderPlayer(SYNCED_SONG);
    const component = fixture.componentInstance;
    expect(component.isSyncedMode()).toBe(true);

    const scrollTo = stubScrollTo(fixture);
    component.restart();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('rewinds the view to the top when restarting a song without timestamps', async () => {
    const fixture = await renderPlayer(PLAIN_SONG);
    const component = fixture.componentInstance;
    expect(component.isSyncedMode()).toBe(false);

    const scrollTo = stubScrollTo(fixture);
    component.restart();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('clears playback state and stops on restart', async () => {
    const fixture = await renderPlayer(SYNCED_SONG);
    const component = fixture.componentInstance;

    component.increaseOffset();
    component.activeLineIndex.set(1);
    stubScrollTo(fixture);

    component.restart();

    expect(component.isPlaying()).toBe(false);
    expect(component.activeLineIndex()).toBe(-1);
    expect(component.offsetLabel()).toBe('ajuste: 0.0s');
  });
});
