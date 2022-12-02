import { iTable } from './../../../models/table.model';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-table-list',
    templateUrl: './table-list.component.html',
    styleUrls: ['./table-list.component.scss']
})
export class TableListComponent {
    @Input() tableList: iTable[] = []
    constructor () {}
}
