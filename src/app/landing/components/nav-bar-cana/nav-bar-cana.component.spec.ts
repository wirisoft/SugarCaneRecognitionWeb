import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarCanaComponent } from './nav-bar-cana.component';

describe('NavBarCanaComponent', () => {
  let component: NavBarCanaComponent;
  let fixture: ComponentFixture<NavBarCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavBarCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
