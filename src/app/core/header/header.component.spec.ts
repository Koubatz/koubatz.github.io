import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('links to both routes of the site', () => {
    const hrefs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('nav a[href]')
    ).map(anchor => anchor.getAttribute('href'));

    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/letras');
  });
});
