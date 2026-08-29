import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LyricsApiService } from '../lyrics/lyrics-api.service';
import { Song } from '../lyrics/song.model';

const MIN_SPEED = 1;
const MAX_SPEED = 10;
const PIXELS_PER_SECOND_PER_SPEED = 12;
const MAX_FRAME_DELTA_MS = 100;

@Component({
  selector: 'app-lyrics-player',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lyrics-player.component.html',
  styleUrl: './lyrics-player.component.scss',
})
export class LyricsPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainerRef?: ElementRef<HTMLElement>;

  song: Song | null = null;
  checkedStorage = false;
  isPlaying = false;
  speed = 3;

  readonly minSpeed = MIN_SPEED;
  readonly maxSpeed = MAX_SPEED;

  private readonly isBrowser: boolean;
  private animationFrameId: number | null = null;
  private lastTimestamp: number | null = null;
  private scrollPosition = 0;

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
    this.lyricsApi.getSongs().subscribe((songs) => {
      this.song = songs.find((song) => song.id === id) ?? null;
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
    this.scrollPosition = this.scrollContainerRef?.nativeElement.scrollTop ?? 0;
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
    this.scrollPosition = 0;
    this.scrollContainerRef?.nativeElement.scrollTo({ top: 0 });
  }

  increaseSpeed(): void {
    this.speed = Math.min(this.speed + 1, MAX_SPEED);
  }

  decreaseSpeed(): void {
    this.speed = Math.max(this.speed - 1, MIN_SPEED);
  }

  goBack(): void {
    this.router.navigate(['/letras']);
  }

  private readonly step = (timestamp: number): void => {
    const container = this.scrollContainerRef?.nativeElement;
    if (!container) {
      this.stop();
      return;
    }

    if (this.lastTimestamp !== null) {
      const deltaMs = Math.min(timestamp - this.lastTimestamp, MAX_FRAME_DELTA_MS);
      const pixelsPerSecond = this.speed * PIXELS_PER_SECOND_PER_SPEED;
      this.scrollPosition += (pixelsPerSecond * deltaMs) / 1000;
      container.scrollTop = this.scrollPosition;

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (this.scrollPosition >= maxScroll - 1) {
        this.stop();
        return;
      }
    }

    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame(this.step);
  };
}
