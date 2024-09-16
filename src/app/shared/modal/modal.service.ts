import {
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ModalComponent } from './modal.component';
import { Options } from './options.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  newModalComponent!: ComponentRef<ModalComponent>;
  options!: Options | undefined;

  constructor(private injector: EnvironmentInjector) {}

  open(vcrOrComponent: ViewContainerRef, content: TemplateRef<Element>, options?: Options): void {
    if (vcrOrComponent instanceof ViewContainerRef) {
      this.openWithTemplate(vcrOrComponent, content);
      this.options = options;
    }
  }

  private openWithTemplate(vcr: ViewContainerRef, content: TemplateRef<Element>) {
    vcr.clear();
    const innerContent = vcr.createEmbeddedView(content);

    this.newModalComponent = vcr.createComponent(ModalComponent, {
      environmentInjector: this.injector,
      projectableNodes: [innerContent.rootNodes],
    });
  }

  close() {
    this.newModalComponent.instance.close();
  }
}
