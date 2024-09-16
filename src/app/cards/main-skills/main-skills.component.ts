import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-main-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-skills.component.html',
  styleUrl: './main-skills.component.scss',
})
export class MainSkillsComponent {
  mainSkillsTitle = 'principais habilidades';
  skills = ['angular', 'typescript', 'sass', 'html'];
  mountSrcImg(item: string): string {
    return `${item}.svg`;
  }
}
