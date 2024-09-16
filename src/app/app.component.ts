import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header.component';
import { AboutMeComponent } from './cards/about-me/about-me.component';
import { WorkExperienceComponent } from './cards/work-experience/work-experience.component';
import { MainSkillsComponent } from './cards/main-skills/main-skills.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    AboutMeComponent,
    WorkExperienceComponent,
    MainSkillsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'koubatz.github.io';
  declare = 'teste';
}
