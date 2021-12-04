import firebase from 'firebase/app'
import { iCard } from '../table/table.model'

export class PlayerModel {
  public deck: iCard[]
  public current: boolean = false
  public allowTake: boolean = true
  public nick: string
  readonly id: string
  readonly submited: Date | firebase.firestore.Timestamp

  constructor(
    nick?: string,
  ) {
    this.nick =  nick || Math.random().toString( 36 ).substring( 6 )
    this.deck = []
    this.id = firebase.firestore().collection( 'players' ).doc().id
    this.submited = new Date()
  }
}

export interface iPlayer extends PlayerModel {
  submited: firebase.firestore.Timestamp
}
