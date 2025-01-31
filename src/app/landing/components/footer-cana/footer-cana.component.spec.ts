import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterCanaComponent } from './footer-cana.component';

describe('FooterCanaComponent', () => {
  let component: FooterCanaComponent;
  let fixture: ComponentFixture<FooterCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FooterCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
