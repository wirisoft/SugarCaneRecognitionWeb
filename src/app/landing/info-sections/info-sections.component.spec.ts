import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSectionsComponent } from './info-sections.component';

describe('InfoSectionsComponent', () => {
  let component: InfoSectionsComponent;
  let fixture: ComponentFixture<InfoSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoSectionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfoSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
