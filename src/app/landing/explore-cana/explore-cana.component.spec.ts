import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCanaComponent } from './explore-cana.component';

describe('ExploreCanaComponent', () => {
  let component: ExploreCanaComponent;
  let fixture: ComponentFixture<ExploreCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExploreCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
