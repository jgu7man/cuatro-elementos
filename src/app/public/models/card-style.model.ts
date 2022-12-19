/**
 * Elements style customizable for cards
 * @export
 * @interface CardStyleModel
 */
export interface CardStyleModel {
  card: CardStyle;
  cardValue: CardValueStyle;
  bigValueContainer: BigValueContainerStyle;
  bigValue: BigValueStyle
}

/**
 * Available styles for card
 * @export
 * @interface CardStyle
 * @extends {Partial<CSSStyleDeclaration>}
 */
export interface CardStyle extends Partial<CSSStyleDeclaration> {
  border: string;
}

/**
 * Available styles for colors card value
 * @export
 * @interface CardValueStyle
 * @extends {Partial<CSSStyleDeclaration>}
 */
export interface CardValueStyle extends Partial<CSSStyleDeclaration> {
  color: string;
  fontWeight: string;
  fontSize: string;
  textShadow: string;
}

/**
 * Available styles for Big Value Container of the Card
 * @export
 * @interface BigValueContainerStyle
 * @extends {Partial<CSSStyleDeclaration>}
 */
export interface BigValueContainerStyle extends Partial<CSSStyleDeclaration> {
  borderRadius: string;
  background: string;
  boxShadow: string;
}

/**
 * Available Styles for Big Value of the Card
 * @export
 * @interface BigValueStyle
 * @extends {Partial<CSSStyleDeclaration>}
 */
export interface BigValueStyle extends Partial<CSSStyleDeclaration> {
  fontWeight: string;
  fontSize: string;
  color: string;
  textShadow: string;
}


