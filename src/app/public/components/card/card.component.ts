import { Component, Input } from '@angular/core';
import { CardStyleModel } from '../../models/card-style.model';
import { iCard } from '../../models/table.model';
import { TableService } from '../../services/table.service';
import { defaultCardStyles } from '../../theme';

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

