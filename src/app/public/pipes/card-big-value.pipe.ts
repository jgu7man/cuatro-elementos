import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { cardValueMap, iCard } from '../components/table/table.model';

@Pipe({
  name: 'cardBigValue'
})
export class CardBigValuePipe implements PipeTransform {

  constructor(private sanitized: DomSanitizer) {}
  transform( card: iCard, ...args: unknown[] ): unknown {
    const cardValue = cardValueMap.get( card.value )!;
    if ( cardValue < 10 ) {
      return `${ cardValue }`
    } else if ( cardValue === 10 ) {
      return '+2'
    } else if ( cardValue === 11 ) {
      return '+4'
    } else if ( cardValue === 12 ) {
      return `<i class="fas fa-ban"></i>`
    } else if ( cardValue === 13 ) {
      return `<i class="fas fa-sync-alt"></i>`
    } else if ( cardValue === 14 ) {
      return this.sanitized.bypassSecurityTrustHtml(`
      <div class="wildcard wildcard-small">
        <div style="background:#d20019"></div>
        <div style="background:#0059b1"></div>
        <div style="background:#d8c100"></div>
        <div style="background:#347c2a"></div>
      </div>`)
    } else {
      return ''
    }
    return null;
  }

}
