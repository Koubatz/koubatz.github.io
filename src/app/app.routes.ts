import { Routes } from '@angular/router';
import { CurriculumComponent } from './pages/curriculum/curriculum.component';
import { LyricsComponent } from './pages/lyrics/lyrics.component';
import { LyricsPlayerComponent } from './pages/lyrics-player/lyrics-player.component';

export const routes: Routes = [
  { path: '', component: CurriculumComponent },
  { path: 'letras', component: LyricsComponent },
  { path: 'letras/:id', component: LyricsPlayerComponent },
];
