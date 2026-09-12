import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MAX_VALID_BPM, MIN_VALID_BPM } from './bpm-range';
import { isSyncedLyrics, parseLrc } from './lrc';
import { LyricsApiService } from './lyrics-api.service';
import { Song } from './song.model';

@Component({
  selector: 'app-lyrics',
  imports: [FormsModule, RouterLink],
  templateUrl: './lyrics.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './lyrics.component.scss',
})
export class LyricsComponent implements OnInit {
  songs: Song[] = [];
  search = '';
  expandedId: string | null = null;
  loading = true;
  saveError = false;

  newTitle = '';
  newArtist = '';
  newLyrics = '';
  newBpm: number | null = null;

  private readonly isBrowser: boolean;

  constructor(
    private readonly lyricsApi: LyricsApiService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    this.lyricsApi.getSongs().subscribe(songs => {
      this.songs = songs;
      this.loading = false;
    });
  }

  get newLyricsSyncedLineCount(): number {
    return parseLrc(this.newLyrics).length;
  }

  isSongSynced(song: Song): boolean {
    return isSyncedLyrics(song.lyrics);
  }

  get filteredSongs(): Song[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.songs;
    }
    return this.songs.filter(
      song => song.title.toLowerCase().includes(term) || song.artist.toLowerCase().includes(term)
    );
  }

  addSong(): void {
    const title = this.newTitle.trim();
    const lyrics = this.newLyrics.trim();
    if (!title || !lyrics) {
      return;
    }

    const hasValidBpm =
      typeof this.newBpm === 'number' &&
      Number.isFinite(this.newBpm) &&
      this.newBpm >= MIN_VALID_BPM &&
      this.newBpm <= MAX_VALID_BPM;
    const song: Song = {
      id: this.generateId(),
      title,
      artist: this.newArtist.trim(),
      lyrics,
      ...(hasValidBpm ? { bpm: this.newBpm as number } : {}),
    };

    this.songs = [song, ...this.songs];
    this.persist();

    this.newTitle = '';
    this.newArtist = '';
    this.newLyrics = '';
    this.newBpm = null;
  }

  removeSong(song: Song): void {
    if (!confirm(`Remover a letra de "${song.title}"?`)) {
      return;
    }

    this.songs = this.songs.filter(s => s.id !== song.id);
    if (this.expandedId === song.id) {
      this.expandedId = null;
    }
    this.persist();
  }

  toggleExpanded(song: Song): void {
    this.expandedId = this.expandedId === song.id ? null : song.id;
  }

  trackBySongId(_index: number, song: Song): string {
    return song.id;
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private persist(): void {
    this.lyricsApi.saveSongs(this.songs).subscribe(success => {
      this.saveError = !success;
    });
  }
}
