import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

/**
 * Define size container element for deck
 * @export
 * @class WithinDeckDirective
 * @implements {OnChanges}
 */
@Directive({
  selector: '[appWithinDeck]',
})
export class WithinDeckDirective implements OnChanges {
  /**
   * Size of the parent element: cards container
   * @type {number}
   */
  @Input() appWithinDeck?: number;

  constructor(private el: ElementRef) {}

  ngOnChanges(): void {
    this.el.nativeElement.style.width = `${100 / (this.appWithinDeck || 1)}%`;
    if (typeof this.appWithinDeck !== 'number')
      console.error('Falta agregar el tamaño del deck');
  }
}
