import firebase from 'firebase/app'
import { iCard } from './table.model'

export class PlayerModel {
  public nick: string
  readonly id: string
  readonly submited: Date | firebase.firestore.Timestamp


  constructor(
    nick?: string,
  ) {
    this.nick =  nick || Math.random().toString( 36 ).substring( 6 )
    this.id = firebase.firestore().collection( 'players' ).doc().id
    this.submited = new Date()
  }
}

export interface iPlayer extends PlayerModel {
  submited: firebase.firestore.Timestamp
}

export interface iTablePlayer extends iPlayer  {
  deck: iCard[]
  inTurn: boolean
  // allowTake: boolean
  tableId?: string | firebase.firestore.FieldValue
}

export class TablePlayer {
  public deck: iCard[]
  public inTurn: boolean = false
  constructor (
    public id:string,
    public nick: string
  ) {
    this.deck = []
  }

}
