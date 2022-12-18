import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/app';
import { CardColorDefinition, ColorChoice, ColorChoiceType } from '../models/colors.model';
import { ColorsMap } from '../theme';

@Pipe({
  name: 'cardColor',
})
export class CardColorPipe implements PipeTransform {

  defaultReturn: CardColorDefinition = { color: '#202020', label: 'No selected', constrast: '#ffffff' }
  /**
   * Defines the color of the card
   * @param {(ColorChoiceType)} cardColor ColorType
   * @param {...any[]} args
   * @returns {*}  {ColorSelected} An object containing the bg color, contrast text, and color label
   */
  transform(
    cardColor: ColorChoiceType,
    ...args: [keyof CardColorDefinition]
  ): CardColorDefinition[keyof CardColorDefinition]  {
    const key = args[0]
    const ColorSelected = ColorsMap.get(cardColor as ColorChoice);
    return (ColorSelected || this.defaultReturn)[key]
  }
}




