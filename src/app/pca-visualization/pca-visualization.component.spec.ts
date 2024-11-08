import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcaVisualizationComponent } from './pca-visualization.component';

describe('PcaVisualizationComponent', () => {
  let component: PcaVisualizationComponent;
  let fixture: ComponentFixture<PcaVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcaVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PcaVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
