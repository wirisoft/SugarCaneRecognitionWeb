import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCanaComponent } from './login-cana.component';

describe('LoginCanaComponent', () => {
  let component: LoginCanaComponent;
  let fixture: ComponentFixture<LoginCanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginCanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
