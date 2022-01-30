import { Component, Input, OnInit } from '@angular/core';
import { iCard } from '../../models/table.model';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() card?: iCard
  @Input() width?: string
  @Input() playerDeck: boolean = false

  constructor (
    public table_: TableService
  ) { }

  ngOnInit(): void {
  }

}
