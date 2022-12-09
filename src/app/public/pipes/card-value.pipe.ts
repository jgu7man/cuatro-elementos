import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { cardValueMap, iCard } from '../models/table.model';

@Pipe({
  name: 'cardValue',
})
export class CardValuePipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  /**
   * Get the card value to print out
   * @param {iCard} card Card
   * @param {...string[]} args
   * @returns {*}  {(string | SafeHtml)} String value to print out
   */
  transform(card: iCard, ...args: string[]): string | SafeHtml {
    const cardValue = cardValueMap.get(card.value)!;
    if (cardValue < 10) {
      return `${cardValue}`;
    } else if (cardValue === 10) {
      return '+2';
    } else if (cardValue === 11) {
      return '+4';
    } else if (cardValue === 12) {
      return `<i class="fas fa-ban"></i>`;
    } else if (cardValue === 13) {
      return `<i class="fas fa-sync-alt"></i>`;
    } else if (cardValue === 14) {
      return this.sanitized.bypassSecurityTrustHtml(`
      <div class="wildcard wildcard-${args[0]}">
        <div class="quart" style="background:#d20019"></div>
        <div class="quart" style="background:#0059b1"></div>
        <div class="quart" style="background:#d8c100"></div>
        <div class="quart" style="background:#347c2a"></div>
      </div>`);
    } else {
      return '';
    }
  }
}
