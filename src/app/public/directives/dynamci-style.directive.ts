import { Directive, ElementRef, Input } from '@angular/core';

/**
 * Overrieds the styles in the component applied.
 * @param {CSSStyleDeclaration} appDynamciStyle Object Partial of CSSStyleDeclaration
 * @note Doesn't apply styles for child components
 * @export as appDynamciStyle
 * @class DynamciStyleDirective
 */
@Directive({
  selector: '[appDynamciStyle]'
})
export class DynamciStyleDirective {
  @Input() appDynamciStyle: Partial<CSSStyleDeclaration> = {}

  constructor (
    private el: ElementRef,
  ) { }

  ngAfterViewChecked(): void {
    Object
      .keys( this.appDynamciStyle )
      .forEach( (prop: any ) => {
        this.el.nativeElement.style[prop] = this.appDynamciStyle[prop]
      })
  }

}
