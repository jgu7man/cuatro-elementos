import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { TableComponent } from './components/table/table.component';
import { MaterialModule } from 'src/shared/material.module';
import { CardColorPipe } from './pipes/card-color.pipe';
import { CardValuePipe } from './pipes/card-value.pipe';
import { CardBigValuePipe } from './pipes/card-big-value.pipe';
import { AvalibleCardPipe } from './pipes/avalible-card.pipe';
import { SelectColorDialog } from './components/select-color/select-color.dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { WinnerDialog } from './components/winner/winner.dialog';
import { SetNicknameDialog } from './components/set-nickname/set-nickname.dialog';
import { CardComponent } from './components/card/card.component';
import { OccupancyPipe } from './pipes/occupancy.pipe';
import { AreInPipe } from './pipes/are-in.pipe';
import { WithinDeckDirective } from './directives/within-deck.directive';
import { AvalibleDropPipe } from './pipes/avalible-drop.pipe';
import { TableListComponent } from './components/lobby/table-list/table-list.component';
import { PlayerAreaComponent } from './components/table/player-area/player-area.component';
import { PlayersListComponent } from './components/table/players-list/players-list.component';
import { ActionsBarComponent } from './components/table/actions-bar/actions-bar.component';


@NgModule({
  declarations: [
    PublicComponent,
    LobbyComponent,
    TableComponent,
    CardColorPipe,
    CardValuePipe,
    CardBigValuePipe,
    AvalibleCardPipe,
    AvalibleDropPipe,
    SelectColorDialog,
    WinnerDialog,
    SetNicknameDialog,
    CardComponent,
    OccupancyPipe,
    AreInPipe,
    WithinDeckDirective,
    TableListComponent,
    PlayerAreaComponent,
    PlayersListComponent,
    ActionsBarComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    OccupancyPipe,
    AreInPipe
  ]
})
export class PublicModule { }
