import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarDashboardCanaComponent } from './nav-bar-dashboard-cana.component';

describe('NavBarDashboardCanaComponent', () => {
  let component: NavBarDashboardCanaComponent;
  let fixture: ComponentFixture<NavBarDashboardCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarDashboardCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavBarDashboardCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
