import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterDashboardCanaComponent } from './footer-dashboard-cana.component';

describe('FooterDashboardCanaComponent', () => {
  let component: FooterDashboardCanaComponent;
  let fixture: ComponentFixture<FooterDashboardCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterDashboardCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FooterDashboardCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
