import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LyricsApiService } from '../lyrics/lyrics-api.service';
import { MAX_VALID_BPM, MIN_VALID_BPM } from '../lyrics/bpm-range';
import { LrcLine, parseLrc } from '../lyrics/lrc';
import { Song } from '../lyrics/song.model';

const MIN_SPEED = 1;
const MAX_SPEED = 10;
const PIXELS_PER_SECOND_PER_SPEED = 12;
const MAX_FRAME_DELTA_MS = 100;
const PIXELS_PER_BEAT = 6;
const OFFSET_STEP_MS = 500;

@Component({
  selector: 'app-lyrics-player',
  templateUrl: './lyrics-player.component.html',
  styleUrl: './lyrics-player.component.scss',
})
export class LyricsPlayerComponent implements OnInit, OnDestroy {
  private readonly scrollContainerRef = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  private readonly lineElements = viewChildren<ElementRef<HTMLElement>>('lineEl');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly lyricsApi = inject(LyricsApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly song = signal<Song | null>(null);
  readonly checkedStorage = signal(false);
  readonly isPlaying = signal(false);
  readonly speed = signal(3);

  // Synced (LRC) playback state — populated in ngOnInit when the song's
  // lyrics contain LRC timestamp tags. When empty, the player falls back to
  // the original continuous pixel-scroll engine below, completely unchanged.
  readonly syncedLines = signal<LrcLine[]>([]);
  readonly activeLineIndex = signal(-1);
  private readonly offsetMs = signal(0);

  readonly minSpeed = MIN_SPEED;
  readonly maxSpeed = MAX_SPEED;

  /** True when the song's lyrics contain LRC timestamps — takes priority over bpm. */
  readonly isSyncedMode = computed(() => this.syncedLines().length > 0);

  /** True when the current song has a usable BPM and playback is tempo-locked to it. */
  readonly isBpmLocked = computed(() => this.isValidBpm(this.song()?.bpm));

  /** e.g. "ajuste: +0.5s" / "ajuste: 0.0s" / "ajuste: -1.0s" */
  readonly offsetLabel = computed(() => {
    const seconds = this.offsetMs() / 1000;
    const sign = seconds > 0 ? '+' : '';
    return `ajuste: ${sign}${seconds.toFixed(1)}s`;
  });

  // Frame-loop state deliberately kept off the signal graph: these change on
  // every frame but nothing renders them, so making them reactive would
  // schedule change detection 60 times a second for no visible effect.
  private animationFrameId: number | null = null;
  private lastTimestamp: number | null = null;
  private scrollPosition = 0;
  private elapsedMs = 0;

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    this.lyricsApi.getSongs().subscribe(songs => {
      const song = songs.find(candidate => candidate.id === id) ?? null;
      this.song.set(song);
      this.syncedLines.set(song ? parseLrc(song.lyrics) : []);
      this.checkedStorage.set(true);
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.stop();
    } else {
      this.play();
    }
  }

  play(): void {
    if (!this.isBrowser || this.isPlaying()) {
      return;
    }
    if (!this.isSyncedMode()) {
      this.scrollPosition = this.scrollContainerRef()?.nativeElement.scrollTop ?? 0;
    }
    this.isPlaying.set(true);
    this.lastTimestamp = null;
    this.animationFrameId = requestAnimationFrame(this.step);
  }

  stop(): void {
    this.isPlaying.set(false);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTimestamp = null;
  }

  restart(): void {
    this.stop();
    if (this.isSyncedMode()) {
      this.elapsedMs = 0;
      this.offsetMs.set(0);
      this.activeLineIndex.set(-1);
    } else {
      this.scrollPosition = 0;
    }
    this.scrollContainerRef()?.nativeElement.scrollTo({ top: 0 });
  }

  increaseSpeed(): void {
    this.speed.update(speed => Math.min(speed + 1, MAX_SPEED));
  }

  decreaseSpeed(): void {
    this.speed.update(speed => Math.max(speed - 1, MIN_SPEED));
  }

  increaseOffset(): void {
    this.offsetMs.update(offset => offset + OFFSET_STEP_MS);
  }

  decreaseOffset(): void {
    this.offsetMs.update(offset => offset - OFFSET_STEP_MS);
  }

  goBack(): void {
    this.router.navigate(['/letras']);
  }

  private isValidBpm(bpm: number | undefined): bpm is number {
    return typeof bpm === 'number' && Number.isFinite(bpm) && bpm > 0;
  }

  /**
   * Target scroll rate in pixels/second. When the song has a BPM, playback is
   * tempo-locked to it and the manual 1-10 speed knob no longer applies —
   * this already returns the final rate, not a "per speed unit" figure.
   * Otherwise it falls back to the manual speed knob (1-10) scaled linearly.
   */
  private getPixelsPerSecond(): number {
    const bpm = this.song()?.bpm;
    if (this.isValidBpm(bpm)) {
      const clampedBpm = Math.min(Math.max(bpm, MIN_VALID_BPM), MAX_VALID_BPM);
      return (clampedBpm / 60) * PIXELS_PER_BEAT;
    }
    return this.speed() * PIXELS_PER_SECOND_PER_SPEED;
  }

  private updateActiveLine(): void {
    const lines = this.syncedLines();
    const adjustedElapsedSeconds = (this.elapsedMs + this.offsetMs()) / 1000;
    let newIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= adjustedElapsedSeconds) {
        newIndex = i;
      }
    }

    if (newIndex !== this.activeLineIndex()) {
      this.activeLineIndex.set(newIndex);
      this.scrollActiveLineIntoView(newIndex);
    }
  }

  private scrollActiveLineIntoView(index: number): void {
    if (!this.isBrowser || index < 0) {
      return;
    }
    this.lineElements()
      [index]?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private readonly step = (timestamp: number): void => {
    const container = this.scrollContainerRef()?.nativeElement;
    if (!container) {
      this.stop();
      return;
    }

    if (this.lastTimestamp !== null) {
      const deltaMs = Math.min(timestamp - this.lastTimestamp, MAX_FRAME_DELTA_MS);

      if (this.isSyncedMode()) {
        this.elapsedMs += deltaMs;
        this.updateActiveLine();
      } else {
        const pixelsPerSecond = this.getPixelsPerSecond();
        this.scrollPosition += (pixelsPerSecond * deltaMs) / 1000;
        container.scrollTop = this.scrollPosition;

        const maxScroll = container.scrollHeight - container.clientHeight;
        if (this.scrollPosition >= maxScroll - 1) {
          this.stop();
          return;
        }
      }
    }

    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame(this.step);
  };
}
