import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
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
  styleUrl: './lyrics.component.scss',
})
export class LyricsComponent implements OnInit {
  private readonly lyricsApi = inject(LyricsApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly songs = signal<Song[]>([]);
  readonly search = signal('');
  readonly expandedId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saveError = signal(false);

  readonly newTitle = signal('');
  readonly newArtist = signal('');
  readonly newLyrics = signal('');
  readonly newBpm = signal<number | null>(null);

  readonly newLyricsSyncedLineCount = computed(() => parseLrc(this.newLyrics()).length);

  readonly filteredSongs = computed(() => {
    const term = this.search().trim().toLowerCase();
    const songs = this.songs();
    if (!term) {
      return songs;
    }
    return songs.filter(
      song => song.title.toLowerCase().includes(term) || song.artist.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.loading.set(false);
      return;
    }

    this.lyricsApi.getSongs().subscribe(songs => {
      this.songs.set(songs);
      this.loading.set(false);
    });
  }

  isSongSynced(song: Song): boolean {
    return isSyncedLyrics(song.lyrics);
  }

  addSong(): void {
    const title = this.newTitle().trim();
    const lyrics = this.newLyrics().trim();
    if (!title || !lyrics) {
      return;
    }

    const bpm = this.newBpm();
    const hasValidBpm =
      typeof bpm === 'number' && Number.isFinite(bpm) && bpm >= MIN_VALID_BPM && bpm <= MAX_VALID_BPM;
    const song: Song = {
      id: this.generateId(),
      title,
      artist: this.newArtist().trim(),
      lyrics,
      ...(hasValidBpm ? { bpm } : {}),
    };

    this.songs.update(songs => [song, ...songs]);
    this.persist();

    this.newTitle.set('');
    this.newArtist.set('');
    this.newLyrics.set('');
    this.newBpm.set(null);
  }

  removeSong(song: Song): void {
    if (!confirm(`Remover a letra de "${song.title}"?`)) {
      return;
    }

    this.songs.update(songs => songs.filter(candidate => candidate.id !== song.id));
    if (this.expandedId() === song.id) {
      this.expandedId.set(null);
    }
    this.persist();
  }

  toggleExpanded(song: Song): void {
    this.expandedId.update(current => (current === song.id ? null : song.id));
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private persist(): void {
    this.lyricsApi.saveSongs(this.songs()).subscribe(success => {
      this.saveError.set(!success);
    });
  }
}
