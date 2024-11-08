import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonVisualizationComponent } from './button-visualization.component';

describe('ButtonVisualizationComponent', () => {
  let component: ButtonVisualizationComponent;
  let fixture: ComponentFixture<ButtonVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ButtonVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
