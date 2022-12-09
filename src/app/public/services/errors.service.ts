import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import Swal, { SweetAlertOptions } from 'sweetalert2';

export enum ErrorSeverity {
  ALERT = 'alert',
  SNACK = 'snack',
  NONE = ''
}

@Injectable( {
  providedIn: 'root',
} )
export class ErrorsService {
  alertBody: SweetAlertOptions = {
    icon: 'error',
    title: 'Error',
    text: 'Oops! Algo no funciona',
  };

  constructor ( private _snack: MatSnackBar ) { }

  public handle( error: any ): Observable<undefined> {
    console.error(error);
    if ( error.code ) this._selectMessage( error.code );

    if ( error.severity ) {
      switch ( error.severity ) {
        case ErrorSeverity.SNACK:
          this._snack.open( this.alertBody.text || 'Error desconocido', 'X', {
            duration: 3000,
          } );
          break;

        default:
          Swal.fire( this.alertBody );
          break;
      }
    }
    return of( undefined );
  }

  _selectMessage( code: string ) {
    const alertOption = this.codeMessagesMap.get( code )
    this.alertBody = {
      ...this.alertBody,
      ...alertOption
    }
  }

  /**
   *
   *
   * @type {Map<string, SweetAlertOptions>}
   */
  codeMessagesMap: Map<string, SweetAlertOptions> = new Map( [
    [ 'table/not-found', {
      title: 'Mesa no encontrada',
      text: '¡Ups! Disculpa, no pudimos encontrar la mesa que buscas. Tal vez quieras revisar bien el código o crear una nueva 😊.'
    } ],
    [ 'table/could-not-create', {
      title: 'No pudimos crear la mesa',
      text: '¡Ups! Disculpa, no pudimos crear la mesa. Tal vez quieras revisar tu conexión a internet o crear una nueva 😊.'
    } ],
    [ 'table/ref-not-found', {
      title: 'Mesa no encontrada',
      text: 'Se perdió la referencia de la mesa. ¿Estás seguro de existe?'
    } ],
    [ 'table/players-not-found', {
      title: 'Sin juegadores',
      text: 'No pudimos encotrar a los juegadores de esta mesa.'
    } ],
    [ 'table/started', {
      title: 'Mesa iniciada',
      text: 'La partida ya inició'
    } ],
    [ 'table/card-previously-dropped', {
      title: '¡Carta repetida! 😮',
      text: '¡Ah caray!. Esta carta ya había sido usada antes.'
    } ],
    [ 'table/not-cards-dropped', {
      title: 'No hay cartas usadas 🤔',
      text: 'Interesante. O el juego no ha iniciado o alguien hackeó esto.'
    } ],
    [ 'table/deck-not-found', {
      title: 'No hay cartas por usar 🤔',
      text: 'Interesante. O el juego ya terminó o alguien hackeó esto.'
    } ],
    [ 'player/not-found', {
      title: 'Hola, ¿Quién eres?',
      text: 'Parece que se ha perdido la conexión con el registro del jugador. Vuelva a ingresar'
    } ],
    [ 'player/cannot-take', {
      title: 'No te rindas',
      text: 'Aún puedes jugar cartas de tu mano'
    }],
    [ 'player/not-allowed', {
      title: '¡Espera!',
      text: '💆 Aún no es tu turno'
    } ],
    [ 'player/are-not-in-table', {
      title: 'Oops!',
      text: 'El jugador ya no está en la mesa'
    }],
    [ 'player/can-not-set', {
      title: 'Hubo un problema',
      text: 'No se pudo crear o actualizar el jugador. Intenta de nuevo o revisa tu conexión a internet. Si persiste, puede que se nos haya acabdo el saldo a nosotros 🤕'
    } ],
    [ 'player/actually-in', {
      title: 'Espera',
      text: 'Ya te encuentras jugando en otra mesa, debes dejar la otra o no querer entrar acá'
    } ],
    [ 'player/can-not-connect', {
      title: 'Error al conectar',
      text: 'No hay conexión con el jugador'
    }],
    [ 'table-list/can-not-connect', {
      title: 'Error al conectar',
      text: 'No hay conexión con la lista de mesas'
    }]
  ]);
}
