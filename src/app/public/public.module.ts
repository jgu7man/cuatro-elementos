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


@NgModule({
  declarations: [
    PublicComponent,
    LobbyComponent,
    TableComponent,
    CardColorPipe,
    CardValuePipe,
    CardBigValuePipe
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    MaterialModule
  ]
})
export class PublicModule { }
