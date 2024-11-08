import { Directive, ViewContainerRef, Input } from '@angular/core';

@Directive({
  selector: '[appDynamicHost]', // Ensure this matches your template selector
  standalone: true
})
export class DynamicHostDirective {
  @Input() option! : string;
  constructor(public viewContainerRef: ViewContainerRef) {} // Expose ViewContainerRef
}
