import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Song } from './song.model';

const SONGS_ASSET_URL = 'data/lyrics.json';
const SONGS_API_URL = '/api/songs';

@Injectable({ providedIn: 'root' })
export class LyricsApiService {
  private readonly http = inject(HttpClient);

  getSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(SONGS_ASSET_URL).pipe(catchError(() => of([])));
  }

  saveSongs(songs: Song[]): Observable<boolean> {
    return this.http.put(SONGS_API_URL, songs).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
