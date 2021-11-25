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


@NgModule({
  declarations: [
    PublicComponent,
    LobbyComponent,
    TableComponent,
    CardColorPipe,
    CardValuePipe,
    CardBigValuePipe,
    AvalibleCardPipe,
    SelectColorDialog,
    WinnerDialog
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class PublicModule { }
