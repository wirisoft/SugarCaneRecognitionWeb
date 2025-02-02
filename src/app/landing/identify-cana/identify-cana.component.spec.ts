import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyCanaComponent } from './identify-cana.component';

describe('IdentifyCanaComponent', () => {
  let component: IdentifyCanaComponent;
  let fixture: ComponentFixture<IdentifyCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentifyCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IdentifyCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
