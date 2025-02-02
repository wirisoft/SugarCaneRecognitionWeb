import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCanaComponent } from './register-cana.component';

describe('RegisterCanaComponent', () => {
  let component: RegisterCanaComponent;
  let fixture: ComponentFixture<RegisterCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
