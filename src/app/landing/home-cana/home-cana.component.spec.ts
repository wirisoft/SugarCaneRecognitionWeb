import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCanaComponent } from './home-cana.component';

describe('HomeCanaComponent', () => {
  let component: HomeCanaComponent;
  let fixture: ComponentFixture<HomeCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
