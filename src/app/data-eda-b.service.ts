import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as d3 from 'd3';
import { SujetoData } from './sujeto_question.model'; // Replace with your actual path

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataSubject = new BehaviorSubject<SujetoData[]>([]);
  data$: Observable<SujetoData[]> = this.dataSubject.asObservable();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    d3.json<SujetoData[]>('assets/eda_complete_A.json')
      .then((data) => {
        if (data === undefined) {
          console.error("No data loaded.");
          return;
        }
        this.dataSubject.next(data); // Store data in the BehaviorSubject
      })
      .catch((error) => {
        console.error('Error loading JSON:', error);
      });
  }
}
