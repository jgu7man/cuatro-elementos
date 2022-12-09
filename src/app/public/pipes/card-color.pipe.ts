import { Pipe, PipeTransform } from '@angular/core';
import { ColorType } from '../models/table.model';
import firebase from 'firebase/app';

@Pipe({
  name: 'cardColor',
})
export class CardColorPipe implements PipeTransform {
  /**
   * Defines the color of the card
   * @param {(ColorType | firebase.firestore.FieldValue)} cardColor ColorType
   * @param {...any[]} args
   * @returns {*}  {ColorSelected} An object containing the bg color, contrast text, and color label
   */
  transform(
    cardColor: ColorType | firebase.firestore.FieldValue,
    ...args: any[]
  ): ColorSelected {
    const ColorSelected = ColorsMap.get(cardColor as ColorType);
    return (
      ColorSelected || { bg: '#202020', txt: 'No selected', color: '#ffffff' }
    );
  }
}

/**
 * Get color object from ColorType property
 * @type {*}
 */
export const ColorsMap: any = new Map<ColorType, ColorSelected>([
  ['blk', { bg: '#202020', txt: 'No selected', color: '#ffffff' }],
  ['blu', { bg: '#0059b1', txt: 'Azul', color: '#ffffff' }],
  ['grn', { bg: '#347c2a', txt: 'Verde', color: '#ffffff' }],
  ['red', { bg: '#d20019', txt: 'Rojo', color: '#ffffff' }],
  ['ylw', { bg: '#d8c100', txt: 'Amarillo', color: '#000000' }],
]);

/**
 * Object of the color card properties
 *
 * @export
 * @interface ColorSelected
 */
export interface ColorSelected {
  /**
   * Card background color
   * @type {string}
   */
  bg: string;
  /**
   * Label color
   * @type {string}
   */
  txt: string;
  /**
   * Color text contrast
   * @type {string}
   */
  color: string;
}
