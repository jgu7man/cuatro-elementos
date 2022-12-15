import { Component, Input, Directive, ElementRef, AfterViewChecked } from '@angular/core';
import { CardElementStyle, CardStyleModel, defaultCardStyles } from '../../models/card-style.model';
import { iCard } from '../../models/table.model';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  readonly cardStyle: CardStyleModel = defaultCardStyles
  /**
   * Card object value
   * @type {iCard}
   */
  @Input() card?: iCard;
  /**
   * Dynamic width of card container, based on the cant of cards in deck
   * @type {string}
   */
  @Input() width?: string;
  /**
   * Deck of the player
   * @type {boolean}
   */
  @Input() playerDeck: boolean = false;

  constructor(public table_: TableService) {}
}

@Directive({ selector: '[appCardStyle]' })
export class CardStyleDirective implements AfterViewChecked {

  @Input() appCardStyle: CardStyleModel = defaultCardStyles

  get card(): HTMLElement {
    if (!this.el.nativeElement) throw {}
    return this.el.nativeElement
  }
  get cardContent(): HTMLElement {
    if (!this.card ) throw {}
    return this.card.firstChild as HTMLElement
  }
  get cardValue(): HTMLElement {
    if (!this.cardContent) throw {}
    return this.cardContent.firstChild as HTMLElement
  }
  get bigValueContainer(): HTMLElement {
    if (!this.cardContent) throw {}
    return this.cardContent.children[1] as HTMLElement
  }
  get bigValue(): HTMLElement {
    if (!this.bigValueContainer) throw {}
    return this.bigValueContainer.firstChild as HTMLElement
  }

  constructor ( private el: ElementRef ) {}

  ngAfterViewChecked(): void {
    this._setStyles( this.card, this.appCardStyle.card )
    this._setStyles( this.cardValue, this.appCardStyle.cardValue )
    this._setStyles( this.bigValueContainer, this.appCardStyle.bigValueContainer )
    this._setStyles( this.bigValue, this.appCardStyle.bigValue )

  }

  private _setStyles(element: HTMLElement, styles: CardElementStyle ) {
    Object
      .keys( styles )
      .forEach( (prop: any) => {
        element.style[prop] = styles[prop as keyof CardElementStyle]
      })
  }

}


