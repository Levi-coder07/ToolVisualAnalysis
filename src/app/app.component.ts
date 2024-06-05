import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimeSeriesChartComponent } from './time-series-chart/time-series-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , TimeSeriesChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'visual-analysis-tool';
}
