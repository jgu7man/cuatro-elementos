import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ColorChoice } from '../models/colors.model';
import { cardValueMap, iCard } from '../models/table.model';
import { ColorsMap } from '../theme';

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
        <div class="quart" style="background:${ColorsMap.get(ColorChoice.RED)}"></div>
        <div class="quart" style="background:${ColorsMap.get(ColorChoice.BLUE)}"></div>
        <div class="quart" style="background:${ColorsMap.get(ColorChoice.YELLOW)}"></div>
        <div class="quart" style="background:${ColorsMap.get(ColorChoice.GREEN)}"></div>
      </div>`);
    } else {
      return '';
    }
  }
}
