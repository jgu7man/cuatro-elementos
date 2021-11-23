import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectColorDialog } from './select-color.dialog';

describe('SelectColorDialog', () => {
  let component: SelectColorDialog;
  let fixture: ComponentFixture<SelectColorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectColorDialog ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectColorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
