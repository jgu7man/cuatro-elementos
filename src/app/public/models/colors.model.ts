import firebase from 'firebase/app'

export enum ColorChoice {
  RED = 'red',
  GREEN = 'grn',
  BLUE = 'blu',
  YELLOW = 'ylw',
  BLACK = 'blk'
}

export type ColorChoiceType = ColorChoice | firebase.firestore.FieldValue

/**
 * Object of the color card properties
 *
 * @export
 * @interface ColorSelected
 */
export interface CardColorDefinition {
  /**
   * Card background color
   * @type {string}
   */
  color: string;
  /**
   * Label color
   * @type {string}
   */
  label: string;
  /**
   * Color text contrast
   * @type {string}
   */
  constrast: string;
}
