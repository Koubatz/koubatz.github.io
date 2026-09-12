import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [RouterLink],
  templateUrl: './lyrics-player.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './lyrics-player.component.scss',
})
export class LyricsPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainerRef?: ElementRef<HTMLElement>;
  @ViewChildren('lineEl') lineElements!: QueryList<ElementRef<HTMLElement>>;

  song: Song | null = null;
  checkedStorage = false;
  isPlaying = false;
  speed = 3;

  // Synced (LRC) playback state — populated in ngOnInit when the song's
  // lyrics contain LRC timestamp tags. When empty, the player falls back to
  // the original continuous pixel-scroll engine below, completely unchanged.
  syncedLines: LrcLine[] = [];
  activeLineIndex = -1;

  readonly minSpeed = MIN_SPEED;
  readonly maxSpeed = MAX_SPEED;

  private readonly isBrowser: boolean;
  private animationFrameId: number | null = null;
  private lastTimestamp: number | null = null;
  private scrollPosition = 0;

  // Synced-mode accumulators, mirroring scrollPosition's pattern: our own
  // running float total, only ever written forward from deltaMs — never
  // derived by reading anything back from the DOM/browser.
  private elapsedMs = 0;
  private offsetMs = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly lyricsApi: LyricsApiService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    this.lyricsApi.getSongs().subscribe(songs => {
      this.song = songs.find(song => song.id === id) ?? null;
      this.syncedLines = this.song ? parseLrc(this.song.lyrics) : [];
      this.checkedStorage = true;
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  play(): void {
    if (!this.isBrowser || this.isPlaying) {
      return;
    }
    if (!this.isSyncedMode) {
      this.scrollPosition = this.scrollContainerRef?.nativeElement.scrollTop ?? 0;
    }
    this.isPlaying = true;
    this.lastTimestamp = null;
    this.animationFrameId = requestAnimationFrame(this.step);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTimestamp = null;
  }

  restart(): void {
    this.stop();
    if (this.isSyncedMode) {
      this.elapsedMs = 0;
      this.offsetMs = 0;
      this.activeLineIndex = -1;
    } else {
      this.scrollPosition = 0;
      this.scrollContainerRef?.nativeElement.scrollTo({ top: 0 });
    }
  }

  increaseSpeed(): void {
    this.speed = Math.min(this.speed + 1, MAX_SPEED);
  }

  decreaseSpeed(): void {
    this.speed = Math.max(this.speed - 1, MIN_SPEED);
  }

  increaseOffset(): void {
    this.offsetMs += OFFSET_STEP_MS;
  }

  decreaseOffset(): void {
    this.offsetMs -= OFFSET_STEP_MS;
  }

  /** e.g. "ajuste: +0.5s" / "ajuste: 0.0s" / "ajuste: -1.0s" */
  get offsetLabel(): string {
    const seconds = this.offsetMs / 1000;
    const sign = seconds > 0 ? '+' : '';
    return `ajuste: ${sign}${seconds.toFixed(1)}s`;
  }

  goBack(): void {
    this.router.navigate(['/letras']);
  }

  /** True when the song's lyrics contain LRC timestamps — takes priority over bpm. */
  get isSyncedMode(): boolean {
    return this.syncedLines.length > 0;
  }

  /** True when the current song has a usable BPM and playback is tempo-locked to it. */
  get isBpmLocked(): boolean {
    return this.isValidBpm(this.song?.bpm);
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
    const bpm = this.song?.bpm;
    if (this.isValidBpm(bpm)) {
      const clampedBpm = Math.min(Math.max(bpm, MIN_VALID_BPM), MAX_VALID_BPM);
      return (clampedBpm / 60) * PIXELS_PER_BEAT;
    }
    return this.speed * PIXELS_PER_SECOND_PER_SPEED;
  }

  private updateActiveLine(): void {
    const adjustedElapsedSeconds = (this.elapsedMs + this.offsetMs) / 1000;
    let newIndex = -1;
    for (let i = 0; i < this.syncedLines.length; i++) {
      if (this.syncedLines[i].time <= adjustedElapsedSeconds) {
        newIndex = i;
      }
    }

    if (newIndex !== this.activeLineIndex) {
      this.activeLineIndex = newIndex;
      this.scrollActiveLineIntoView();
    }
  }

  private scrollActiveLineIntoView(): void {
    if (!this.isBrowser || this.activeLineIndex < 0) {
      return;
    }
    const activeElement = this.lineElements?.toArray()[this.activeLineIndex];
    activeElement?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private readonly step = (timestamp: number): void => {
    const container = this.scrollContainerRef?.nativeElement;
    if (!container) {
      this.stop();
      return;
    }

    if (this.lastTimestamp !== null) {
      const deltaMs = Math.min(timestamp - this.lastTimestamp, MAX_FRAME_DELTA_MS);

      if (this.isSyncedMode) {
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
