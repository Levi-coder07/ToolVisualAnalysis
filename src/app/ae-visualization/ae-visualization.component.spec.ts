import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AeVisualizationComponent } from './ae-visualization.component';

describe('AeVisualizationComponent', () => {
  let component: AeVisualizationComponent;
  let fixture: ComponentFixture<AeVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AeVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AeVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
