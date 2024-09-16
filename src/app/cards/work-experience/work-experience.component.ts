import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from '../../shared/modal/modal.service';
import { Experience } from './experience.model';

@Component({
  selector: 'app-work-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
})
export class WorkExperienceComponent {
  @ViewChild('view', { static: true, read: ViewContainerRef })
  vcr!: ViewContainerRef;
  workExperienceTitle = 'experiências profissionais';
  showInfoModal = false;
  experiences: Experience[] = [
    {
      company: 'itaú',
      date: '11/2020 - atualmente',
      showDescription: false,
      description: `Ut fermentum porta nisi, eget consequat massa aliquam ac. Proin metus ipsum, molestie nec sollicitudin sed,
        consequat in est. Nam non eros in tortor elementum ultrices. Quisque mattis risus enim, ut hendrerit diam lacinia sed.
        Nulla eget volutpat odio. Proin tortor ligula, ornare sed condimentum at, tempus nec nulla. Mauris auctor dolor in ipsum vehicula dapibus.
        Aliquam vel magna sem. Mauris sit amet egestas velit. Cras vitae efficitur sapien. Aenean et odio ac magna semper accumsan in eu velit.
        Sed dictum sem in consequat semper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus urna est, faucibus facilisis odio eget, vulputate ultrices nisl.
        Maecenas condimentum dapibus efficitur. Suspendisse ac gravida metus.`,
    },
    {
      company: 'itaú',
      date: '11/2020 - atualmente',
      showDescription: false,
      description: `Ut fermentum porta nisi, eget consequat massa aliquam ac. Proin metus ipsum, molestie nec sollicitudin sed,
        consequat in est. Nam non eros in tortor elementum ultrices. Quisque mattis risus enim, ut hendrerit diam lacinia sed.
        Nulla eget volutpat odio. Proin tortor ligula, ornare sed condimentum at, tempus nec nulla. Mauris auctor dolor in ipsum vehicula dapibus.
        Aliquam vel magna sem. Mauris sit amet egestas velit. Cras vitae efficitur sapien. Aenean et odio ac magna semper accumsan in eu velit.
        Sed dictum sem in consequat semper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus urna est, faucibus facilisis odio eget, vulputate ultrices nisl.
        Maecenas condimentum dapibus efficitur. Suspendisse ac gravida metus.`,
    },
    {
      company: 'itaú',
      date: '11/2020 - atualmente',
      showDescription: false,
      description: `Ut fermentum porta nisi, eget consequat massa aliquam ac. Proin metus ipsum, molestie nec sollicitudin sed,
        consequat in est. Nam non eros in tortor elementum ultrices. Quisque mattis risus enim, ut hendrerit diam lacinia sed.
        Nulla eget volutpat odio. Proin tortor ligula, ornare sed condimentum at, tempus nec nulla. Mauris auctor dolor in ipsum vehicula dapibus.
        Aliquam vel magna sem. Mauris sit amet egestas velit. Cras vitae efficitur sapien. Aenean et odio ac magna semper accumsan in eu velit.
        Sed dictum sem in consequat semper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus urna est, faucibus facilisis odio eget, vulputate ultrices nisl.
        Maecenas condimentum dapibus efficitur. Suspendisse ac gravida metus.`,
    },
  ];

  constructor(private modalService: ModalService) {}

  toggleDescription(item: Experience) {
    item.showDescription = !item.showDescription;
  }

  openModalTemplate(view: TemplateRef<Element>, experience: Experience) {
    this.modalService.open(this.vcr, view, {
      animations: {
        modal: {
          enter: 'enter-scaling 0.3s ease-in',
          leave: 'fade-out 0.3s forwards',
        },
        overlay: {
          enter: 'fade-in 0.5s',
          leave: 'fade-out 0.3s forwards',
        },
      },
      size: {
        width: '40rem',
      },
      item: experience,
    });
    this.showInfoModal = true;
  }

  close() {
    this.modalService.close();
  }
}
