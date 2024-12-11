import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationPointplotComponent } from './configuration-pointplot.component';

describe('ConfigurationPointplotComponent', () => {
  let component: ConfigurationPointplotComponent;
  let fixture: ComponentFixture<ConfigurationPointplotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationPointplotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigurationPointplotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
