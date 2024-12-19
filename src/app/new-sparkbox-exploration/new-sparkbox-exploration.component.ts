import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit , inject ,Output, EventEmitter,PLATFORM_ID, Renderer2 , Input, numberAttribute} from '@angular/core';
import * as d3 from 'd3';
import { D3ZoomEvent } from 'd3';
import { DataService } from '../data-eda-b.service';
import { ZoomTransform } from 'd3';
import { MatCommonModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgModel, NgModelGroup } from '@angular/forms';
import { emit } from 'process';
interface Cuestionarios {
  PANAS: number | null;
  STAI: number | null;
  DIM: number | null;
  SSSQ: number | null;
}
interface CuestionariosBase {
  Base: Cuestionarios;
  TSST: Cuestionarios;
  'Medi 1': Cuestionarios;
  Fun: Cuestionarios;
  'Medi 2': Cuestionarios;
}

interface SujetoQuestion {
  Sujeto: string;
  Cuestionarios: CuestionariosBase;
}

interface SujetoData {
  Sujeto: string;
  Datos: number[];
  Fecha: Date[];
}

export interface ClusterData {
  [key: string]: string[];
}
export interface ClusterInfo {
  type: string;
  metric: string;
  data: ClusterData;
}
interface IntervaloPrueba {
  Prueba: string;
  Inicio: string; // Date en formato string
  Fin: string; // Date en formato string
}
interface IntervalosPruebas {
  Subject: string;
  Pruebas: IntervaloPrueba[];
}
interface pca_data {
  Sujeto : string;
  Point : number[];
}
@Component({
  selector: 'app-new-sparkbox-exploration',
  standalone: true,
  imports: [MatCommonModule,MatSelectModule,CommonModule],
  providers : [DataService],
  templateUrl: './new-sparkbox-exploration.component.html',
  styleUrl: './new-sparkbox-exploration.component.css'
})
export class NewSparkboxExplorationComponent {
  @Output() toggleGridS = new EventEmitter<boolean>();

  private showGridState: boolean = true;
  
  // Emit the new state to the parent
  toggleGrid(): void {
    this.showGridState =false;
    this.toggleGridS.emit(this.showGridState); // Emit the updated state
  }
  @Input() option! : string;
  @Output() pruebaClicked = new EventEmitter<string>();
  public emit(test:string) {
    this.pruebaClicked.emit(test);
  }
  selectedClusterCount: number = 2; // Default cluster count
  selectedMetricType: string = 'dtw'; // Default metric type
  clusterCounts = [2, 3, 4, 5];
  valor : number = 0;
  type = 0;
  globalMaxY = 0;
  private platformId: object;
  private  margin = {top: 10, right: 0, bottom: 10, left: 20};
  private width = 450 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private data: SujetoData[] = [] ;
  private edadata: SujetoData[] = [] ;
  private pca_data : pca_data[] = [];
  public title : string = "Protocolo - WESAD";
  names_pca: string[] = ["eda_pca","eda_segments_pca","fun_pca_eda", "tsst_pca_eda" ];
  names_tsne: string[] = ["eda_tsne","eda_segments_tsne","fun_tsne_eda", "tsst_tsne_eda" ];
  names_options_cluster: string[] = ["complete","segments","fun", "tsst" ];
  metrics: string[] = ["dtw" ,"softdtw" ];
  names: any;
  public colorVector : string[] = [];
  private clusters: ClusterInfo[] = [];
  constructor(private renderer: Renderer2 , private DataService : DataService) {
    this.platformId = inject(PLATFORM_ID);
    
  }
  

  private handleZoom(e : any): void {
    
    d3.select('svg g')
    
    .attr('transform', e.transform);
  }
  
 
 
  private async createChart() {
    // Your existing D3 code here
    let questiondata: SujetoQuestion[] | undefined;
    try {
      questiondata = await d3.json("assets/formatted_question_data2.json");
      
  } catch (error) {
      console.error("Error loading JSON:", error);
      return;
  }
  if (!questiondata) {
    console.error("Loaded JSON is undefined or null");
    return;
}
console.log("questionSpark",questiondata[4].Cuestionarios)
    this.DataService.loadDataEDA();
    this.DataService.edaData$.subscribe(data => {
      this.data = data;
      // Aquí puedes usar this.data en tu componente
      const values = this.data;
     const name = "eda_pca" ;
      this.plot_sparkplot(this.data[4],questiondata[4]);  
      
    
  
    });
   
    // Process filtered EDA data for visualization
    
  
}

ngOnInit(): void {
  if(isPlatformBrowser(this.platformId)){
    this.createChart();
  }
  
  const types = ["complete", "segments", "fun", "tsst"];
    const numbers = [2, 3, 4, 5]; // Cluster numbers
    
}

public emits(test:string) {
  this.pruebaClicked.emit(test);
}
private async plot_sparkplot(data: SujetoData , questionData : SujetoQuestion) {
  var _this = this;
  console.log("inside",questionData.Cuestionarios)
  const margin_focus = {top: 20, right: 30, bottom: 20, left: 20};
      const width_focus = 1000- margin_focus.left - margin_focus.right;
      const height_focus = 200 - margin_focus.top - margin_focus.bottom;
        // Al hacer clic en la línea, actualizar el gráfico secundario
        
        
       // Ancho del gráfico secundario temporal
    
      // Escala Y para el gráfico secundario temporal
      // Alto del gráfico secundario temporal
    
      // Generador de línea para el gráfico secundario temporal
     
        

      // Crear contenedor SVG para el gráfico secundario temporal
      
      const lineSelected = d3.line<number>()
      .x((d, i) => xScaleSelected(new Date(data.Fecha[i])))
      .y(d => yScaleSelected(d))
      .curve(d3.curveMonotoneX);
      let intervalosPruebas: IntervalosPruebas[] | undefined;
      try {
        intervalosPruebas = await d3.json("assets/intervalos_pruebas1.json");
       
    } catch (error) {
        console.error("Error loading JSON:", error);
        return;
    }
    if (!intervalosPruebas) {
      console.error("Loaded JSON is undefined or null");
      return;
  }
  let newGridTile = d3.select("#chart-sparkplot");
  const yScaleSelected = d3.scaleLinear()
        .domain([0, 15]) // Ajusta el dominio según tus datos
        .range([height_focus, 0]); 
  const xScaleSelected = d3.scaleTime()
  .domain([
    new Date(intervalosPruebas[4].Pruebas[0].Inicio), // Convert to Date
    new Date(intervalosPruebas[4].Pruebas[4].Fin) // Convert to Date
  ])
  .range([0, width_focus]);

    
intervalosPruebas.forEach((d:IntervalosPruebas) => {
            console.log("Aqui ",d.Pruebas);

      });

      // Crear contenedor SVG para el gráfico secundario temporal
      const overviewSvg = newGridTile.append("svg")
        .attr("width", width_focus + margin_focus.left + margin_focus.right)
        .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
        .append("g")
        .attr("transform", `translate(${margin_focus.left + 10},${margin_focus.top})`);
/*
      // Agregar la línea seleccionada al gráfico secundario temporal
      const clipPaths = overviewSvg.append("defs");
      let datosFiltrados:any;
      let totalData: any[] = []; 
      let segment = intervalosPruebas[4].Pruebas
      segment.forEach((prueba,index) => {
        datosFiltrados = data.Datos.filter((d, i) => {
          const fecha = new Date(data.Fecha[i]);
          return fecha >= new Date(prueba.Inicio) && fecha <= new Date(prueba.Fin);
        });
        totalData.push(datosFiltrados);
      });
      segment.forEach((Prueba,index) =>{
        console.log("Inicio", new Date(Prueba.Inicio))
        clipPaths.append("clipPath")
          .attr("id", `clip-segment-${index}`)
          .append("rect")
          .attr("x", xScaleSelected(new Date(Prueba.Inicio))) // Segment start time
          .attr("y", 0)
          .attr("width", xScaleSelected(new Date(Prueba.Fin)) - xScaleSelected(new Date(Prueba.Inicio))) // Segment duration
          .attr("height", this.height);
        });
      
      
        segment.forEach((segment, index) => {
        const segmentGroup = overviewSvg.append("g")
          .attr("clip-path", `url(#clip-segment-${index})`);
        
        // Filter data for the current segment
        const segmentData = data.Datos.filter(d => {
          const time = new Date(d);
          return time >= new Date(segment.Inicio) && time <= new Date(segment.Fin);
        });
        let fechasFiltradasSolo = data.Fecha.filter((f) => {
          const fecha = new Date(f);
          return !isNaN(fecha.getTime()) && fecha >= new Date(segment.Inicio) && fecha <= new Date(segment.Fin);
        }).map((f) => new Date(f));
      
        // Plot the line
        segmentGroup.append("path")
          .datum(segmentData)
          .attr("class", "line")
          .attr("d", lineSelected)
          .style("stroke", "steelblue")
          .style("stroke-width", 2)
          .style("fill", "none");
      });
      
       */
      
      
      let segment = intervalosPruebas[4].Pruebas
       
        
        segment.forEach((prueba,index) => {
            const inicio = new Date(prueba.Inicio);
            const fin = new Date(prueba.Fin);
            
            // Filtrar datos que estén dentro del intervalo de tiempo de esta prueba
            
            
            if (questionData && questionData.Cuestionarios) {
              const pruebaData = questionData.Cuestionarios[prueba.Prueba as keyof CuestionariosBase];
              const probaas = questionData.Cuestionarios;
              
                if (!pruebaData) {
                    console.warn(`No data found for prueba: ${prueba.Prueba}`);
                    return;
                }
    
                const cuestionarios = pruebaData;
                const colores = {
                    SSSQ: "rgba(0, 0, 255, 0.6)",
                    PANAS: "rgba(0, 255, 0, .9)",
                    STAI: "rgba(255, 255, 0, 0.6)",
                    DIM: "rgba(0, 255, 255, 0.6)"
                };
                let offsetX = 5;
                let pruebas = ["Base" , "Fun" , "Medi 1" , "TSST" , "Medi 2"];
                let colors = [
                  "rgba(0, 255, 0, 1)",       // Bright Green
                  "rgba(255, 255, 0, 1)",     // Bright Yellow
                  "rgba(0, 191, 255, 1)",     // Deep Sky Blue
                  "rgba(255, 0, 0, 1)",       // Bright Red
                  "rgba(255, 105, 180, 1)"    // Hot Pink
              ];
             
                overviewSvg.append("rect")
                      
                      .attr("x", xScaleSelected(new Date(prueba.Inicio)))
                      .attr("y", 0)
                      .attr("width", xScaleSelected(new Date(prueba.Fin)) - xScaleSelected(new Date(prueba.Inicio)))
                      .attr("height", height_focus)
                      .attr("class" , "Test")
                      .attr("id",prueba.Prueba)
                      .attr("fill", "rgba(0, 150, 255, 0.2)")
                      .on("click", function()  {
                        
                        const pruebaPrueba = prueba.Prueba;
                        const index = pruebas.findIndex(prueba => prueba === pruebaPrueba);
                       
                        d3.selectAll(`rect.Test`).transition().duration(500).attr("fill","rgba(0, 150, 255, 0.2)");
                        d3.selectAll(`rect[id^="${prueba.Prueba}"]`).transition().duration(500).attr("fill",colors[index]);
                        _this.emit(prueba.Prueba);
                      })
                      
                      .on("dblclick", function() {
                        // Perform actions on double-click
                        console.log("Double-clicked on:",prueba);
                        d3.selectAll(`rect.Test`).transition().duration(500).attr("fill","rgba(0, 150, 255, 0.2)");
                        // Example: Change the fill color of the double-clicked path
                      
                            const radar = d3.select(`.radar-grid-tile .scrollable-container`);
                            radar.selectAll(`path`)
                            .transition()
                            .duration(500) // Duration of the transition in milliseconds
                            .attr("opacity", 0.6); // Highlighting the selected path
                      })
                      
                      ;
    
                overviewSvg.append("text")
                    .attr("x", xScaleSelected(new Date(prueba.Inicio)) + 5)
                    .attr("y", 15)
                    .text(prueba.Prueba)
                    .attr("fill", "black")
                    .attr("font-size", "14px");
            } else {
                console.error('questionData or questionData.Cuestionario is undefined');
            }
        });
   
    
    overviewSvg.append("g")
    .attr("transform", `translate(0,${height_focus})`)
    .call(d3.axisBottom(xScaleSelected))
    ;
    if (!questionData) {
            console.error("Loaded JSON is undefined or null");
            return;
        }
    overviewSvg.append("g")
    .call(d3.axisLeft(yScaleSelected).ticks(4));
}

}
/*async function plot_sparkplot(dataArray: SujetoData[]) {
  if (dataArray.length === 0) return;
  console.log(dataArray)
  // Compute the global maxY across all subjects
  const allValues = dataArray.flatMap(d => d.Datos);
  let globalMaxY = d3.max(allValues)!;

  // We'll base our segment intervals on the first subject.
  // If needed, you could extend logic to ensure all have matching segments.
  const referenceData = dataArray[0];

  const margin_focus = {top: 20, right: 20, bottom: 30, left: 20};
  const width_focus = 1400 - margin_focus.left - margin_focus.right;
  const height_focus = 200 - margin_focus.top - margin_focus.bottom;

  // Determine the global date range across the first subject's data (could be extended to all subjects if needed)
  const minDate = d3.min(referenceData.Fecha.map(f => new Date(f))) as Date;
  const maxDate = d3.max(referenceData.Fecha.map(f => new Date(f))) as Date;

  // Initial scales (will adjust after loading intervals)
  const xScaleSelected = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, width_focus]);

  const yScaleSelected = d3.scaleLinear()
    .domain([0, globalMaxY])
    .range([height_focus, 0]);

  // Load interval data
  let intervalosPruebas: IntervalosPruebas[] | undefined;
  try {
    intervalosPruebas = await d3.json("assets/intervalos_pruebas1.json");
  } catch (error) {
    console.error("Error loading JSON:", error);
    return;
  }

  if (!intervalosPruebas) {
    console.error("Loaded JSON is undefined or null");
    return;
  }
  console.log(intervalosPruebas)
  // Find the segment applicable to the first subject
  const segmento = intervalosPruebas.find(
    seg => Array.isArray(seg.Subject) && seg.Subject.includes(referenceData.Sujeto)
  );

  if (!segmento) {
    console.error(`No se encontraron pruebas para el sujeto: ${referenceData.Sujeto}`);
    return;
  }

  // Define the desired order for the tests
  const ordenDeseado = ["Base", "Fun", "Medi 1", "TSST", "Medi 2"];
  const indicePrueba = new Map(ordenDeseado.map((prueba, index) => [prueba, index]));

  // Sort the tests according to the desired order
  segmento.Pruebas.sort((a, b) => {
    const indexA = indicePrueba.get(a.Prueba) ?? Infinity;
    const indexB = indicePrueba.get(b.Prueba) ?? Infinity;
    return indexA - indexB;
  });

  // Adjust times as in the original code
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  let inicioBase = new Date(segmento.Pruebas[0].Inicio);
  segmento.Pruebas.forEach((prueba, index) => {
    const inicioPrueba = new Date(prueba.Inicio);
    const finPrueba = new Date(prueba.Fin);
    const duracionPrueba = finPrueba.getTime() - inicioPrueba.getTime();

    if (index > 0) {
      inicioBase = new Date(new Date(segmento.Pruebas[index - 1].Fin).getTime());
    }

    prueba.Inicio = formatDate(inicioBase);
    prueba.Fin = formatDate(new Date(inicioBase.getTime() + duracionPrueba));
    inicioBase = new Date(prueba.Fin);
  });

  // Now we have adjusted intervals
  const minTime = d3.min(segmento.Pruebas.map(p => new Date(p.Inicio))) as Date;
  const maxTime = d3.max(segmento.Pruebas.map(p => new Date(p.Fin))) as Date;

  const xScaleSelectedNew = d3.scaleTime()
    .domain([minTime, maxTime])
    .range([0, width_focus]);

  // Select or create the SVG
  let overviewSvg: any;
  
  
    overviewSvg = d3.select("#chart-sparkplot").append("svg")
      .attr("width", width_focus + margin_focus.left + margin_focus.right)
      .attr("height", height_focus + margin_focus.top + margin_focus.bottom)
      .append("g")
      .attr("transform", `translate(${margin_focus.left},${margin_focus.top})`);

    overviewSvg.append("text")
      .attr("x", (width_focus / 2))
      .attr("y", 0 - (margin_focus.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .style("text-decoration", "underline")
      .text(`Promedio de Sujetos (${dataArray.length})`);

    overviewSvg.append("g")
      .attr("transform", `translate(0,${height_focus})`)
      .call(d3.axisBottom(xScaleSelectedNew));

    overviewSvg.append("g")
      .attr("class", "axis-y")
      .call(d3.axisLeft(yScaleSelected));
  

  // We will compute an average line for each interval. 
  // Steps:
  // 1. For each interval (prueba), filter data for each subject.
  // 2. Align them by their timestamps (assuming identical timestamps or no interpolation).
  // 3. Compute the average at each time step.
  // 4. Append the line for the average.

  // Collect average data per segment
  let averageDataPerSegment: number[][] = [];
  let commonDatesPerSegment: Date[][] = [];

  segmento.Pruebas.forEach(prueba => {
    const inicio = new Date(prueba.Inicio);
    const fin = new Date(prueba.Fin);
    let segmentValuesAllSubjects: number[][] = [];
    let segmentDates: Date[] = [];

    dataArray.forEach(subject => {
      // Filter this subject's data within the interval
      const filteredIndices = subject.Fecha
        .map((f, i) => ({f: new Date(f), i}))
        .filter(d => d.f >= inicio && d.f <= fin)
        .map(d => d.i);

      const subjectSegmentData = filteredIndices.map(i => subject.Datos[i]);
      const subjectSegmentDates = filteredIndices.map(i => new Date(subject.Fecha[i]));

      
      segmentDates = subjectSegmentDates;
      segmentValuesAllSubjects.push(subjectSegmentData);
    });
    console.log(segmentValuesAllSubjects)
    // Compute average
    if (segmentDates ) {
      let averages: number[] = [];
      for (let idx = 0; idx < segmentDates.length; idx++) {
        // sum across all subjects for the same idx
        let sum = 0;
        let count = 0;
        segmentValuesAllSubjects.forEach(values => {
          if (values[idx] !== undefined) {
            sum += values[idx];
            count++;
          }
        });
        const avg = sum / count;
        averages.push(avg);
      }

      averageDataPerSegment.push(averages);
      commonDatesPerSegment.push(segmentDates);
    } else {
      // No data found in this segment for these subjects
      averageDataPerSegment.push([]);
      commonDatesPerSegment.push([]);
    }
  });

  // Remove old lines before plotting new ones
  overviewSvg.selectAll(".line").remove();

  // Now plot the average lines for each segment
  segmento.Pruebas.forEach((prueba, index) => {
    const segmentDates = commonDatesPerSegment[index];
    const segmentAverages = averageDataPerSegment[index];
    if (segmentDates.length === 0) return;

    // Create line generator for this segment
    const lineGenerator = d3.line<number>()
      .x((d, i) => xScaleSelectedNew(segmentDates[i]))
      .y(d => yScaleSelected(d))
      .curve(d3.curveMonotoneX);

    const lineId = `line-average-${index}`;
    const existingLine = overviewSvg.select(`#${lineId}`);

    if (existingLine.empty()) {
      overviewSvg.append("path")
        .datum(segmentAverages)
        .attr("id", lineId)
        .attr("class", "line")
        .attr("d", lineGenerator)
        .style("stroke", "red")
        .style("stroke-width", 2)
        .style("fill", "none");

      // Add test name and dividing line only if first time
   
        overviewSvg.append("text")
          .attr("x", xScaleSelectedNew(new Date(prueba.Inicio)) + 5)
          .attr("y", 15 * (index + 1))
          .text(prueba.Prueba)
          .attr("fill", "black")
          .attr("font-size", "16px");

        overviewSvg.append("line")
          .attr("x1", xScaleSelectedNew(new Date(prueba.Fin)))
          .attr("y1", 0)
          .attr("x2", xScaleSelectedNew(new Date(prueba.Fin)))
          .attr("y2", height_focus)
          .attr("stroke", "black")
          .attr("stroke-width", 1);
      
    } else {
      // If updating data:
      existingLine
        .transition()
        .duration(1000)
        .attr("d", lineGenerator(segmentAverages));
    }
  });

  // At this point, you have plotted the average data line across all subjects.
}*/
