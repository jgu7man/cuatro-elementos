import firebase from 'firebase/app'
import { iCard } from '../table/table.model'

export class PlayerModel {
  deck: iCard[]
  current: boolean = false
  allowTake: boolean = true
  public nick: string

  constructor(
    nick?: string,
  ) {
    this.nick =  nick || Math.random().toString( 36 ).substring( 6 )
    this.deck = []
  }
}

export interface iPlayer {
  nick: string,
  ingresed: Date | firebase.firestore.Timestamp,
  uid: string,
}
