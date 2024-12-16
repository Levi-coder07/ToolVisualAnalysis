import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as d3 from 'd3';
import { SujetoData } from './sujeto_question.model'; // Replace with your actual path

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private tempDataSubject = new BehaviorSubject<SujetoData[]>([]);
  private edaDataSubject = new BehaviorSubject<SujetoData[]>([]);
  private bvpDataSubject = new BehaviorSubject<SujetoData[]>([]);

  tempData$: Observable<SujetoData[]> = this.tempDataSubject.asObservable();
  edaData$: Observable<SujetoData[]> = this.edaDataSubject.asObservable();
  bvpData$: Observable<SujetoData[]> = this.bvpDataSubject.asObservable();

  constructor() {
    
  }

  public loadData(): void {
    d3.json<SujetoData[]>('assets/temp_complete_A.json')
      .then((data) => {
        if (data === undefined) {
          console.error("No data loaded.");
          return;
        }
        this.tempDataSubject.next(data); // Store data in the BehaviorSubject
      })
      .catch((error) => {
        console.error('Error loading JSON:', error);
      });
  }
  public loadDataEDA(): void {
    d3.json<SujetoData[]>('assets/eda_complete_A.json')
      .then((data) => {
        if (data === undefined) {
          console.error("No data loaded.");
          return;
        }
        this.edaDataSubject.next(data); // Store data in the BehaviorSubject
      })
      .catch((error) => {
        console.error('Error loading JSON:', error);
      });
  }
   public loadDataBVP(): void {
    d3.json<SujetoData[]>('assets/bvp_complete_A.json')
      .then((data) => {
        if (data === undefined) {
          console.error("No data loaded.");
          return;
        }
        this.bvpDataSubject.next(data); // Store data in the BehaviorSubject
      })
      .catch((error) => {
        console.error('Error loading JSON:', error);
      });
  }
}
