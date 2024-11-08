import { Component, ViewChild ,ComponentFactoryResolver } from '@angular/core';
import { DynamicHostDirective } from '../dynamic-host.directive';
@Component({
  selector: 'app-button-visualization',
  standalone: true,
  imports: [],
  templateUrl: './button-visualization.component.html',
  styleUrl: './button-visualization.component.css'
})
export class ButtonVisualizationComponent {
  @ViewChild(DynamicHostDirective, {static : true}) dynamicHost!: DynamicHostDirective;


}
