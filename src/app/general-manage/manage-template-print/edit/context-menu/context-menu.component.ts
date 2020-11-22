import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuPosition } from 'src/app/editor/context-menu/context-menu.component';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {
  menuPosition: MenuPosition;
  @ViewChild(MatMenuTrigger, { static: false }) contextMenu: MatMenuTrigger;

  constructor() { }

  ngOnInit(): void {
    this.menuPosition = {
      positionX: 0,
      positionY: 0
    };
  }

  openMenuContext(target: any, menuPosition: MenuPosition) {
    this.menuPosition = menuPosition;
    this.contextMenu.menuData = { target };
    this.contextMenu.openMenu();
  }

  deleteTarget(target: any) {
    target.remove();
  }
}
