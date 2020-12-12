import { NestedTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { GroupUserService } from 'src/app/core/service/group-user.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';

interface PermissionNode {
  name: string;
  id?: number;
  code?: any;
  refer?: any;
  key?: any;
  selected?: boolean;
  indeterminate?: boolean;
  children?: PermissionNode[];
}

declare var $: any;

@Component({
  selector: 'app-dialog-add-edit',
  templateUrl: './dialog-add-edit.component.html',
  styleUrls: ['./dialog-add-edit.component.scss', '../../../medical-examination/share-style.scss']
})
export class DialogAddEditComponent implements OnInit {

  isEdit: boolean;
  title: string;
  groupUser: any;
  formGroup: FormGroup;

  listPermission = [];
  listPermissionByUser = [];
  listGroupUser = [];

  itemId: null;

  treeData: PermissionNode[] = [];

  treeControl = new NestedTreeControl<PermissionNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<PermissionNode>();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private groupUserService: GroupUserService,
    private dialog: MatDialog,
  ) {
    this.isEdit = data.isEdit;
    this.groupUser = data.groupUser;
    this.listGroupUser = data.listGroupUser;
    this.itemId = data.itemId;
  }

  setDataSource() {
    this.dataSource.data = this.treeData;
    Object.keys(this.dataSource.data).forEach(x => {
      this.setParent(this.dataSource.data[x], null);
    });
    $('.btn-toggle').click();
  }

  hasChild = (_: number, node: PermissionNode) => !!node.children && node.children.length > 0;

  setParent(data: any, parent: any) {
    data.parent = parent;
    if (data.children) {
      data.children.forEach(x => {
        this.setParent(x, data);
      });
    }
  }

  checkAllParents(node: any) {
    if (node.parent) {
      const descendants = this.treeControl.getDescendants(node.parent);
      node.parent.selected = descendants.every(child => child.selected);
      node.parent.indeterminate = descendants.some(child => child.selected);
      this.checkAllParents(node.parent);
    }
  }

  todoItemSelectionToggle(checked: any, node: any) {
    node.selected = checked;
    if (node.children) {
      node.children.forEach(x => {
        this.todoItemSelectionToggle(checked, x);
      });
    }
    this.checkAllParents(node);
    if (checked && node.refer != null) {
      for (const e of this.treeData) {
        if (e.code == node.refer && !e.selected && !e.indeterminate) {
          this.todoItemSelectionToggle(checked, e);
        }
        if (e.children) {
          for (const e2 of e.children) {
            if (e2.code == node.refer && !e2.selected && !e2.indeterminate) {
              this.todoItemSelectionToggle(checked, e2);
            }
            if (e2.children) {
              for (const e3 of e2.children) {
                if (e3.code == node.refer && !e3.selected && !e3.indeterminate) {
                  this.todoItemSelectionToggle(checked, e3);
                }
              }
            }
          }
        }
      }
    }
    if (!checked) {
      for (const e of this.treeData) {
        if (node.code == e.refer) {
          this.todoItemSelectionToggle(checked, e);
        }
        if (e.children) {
          for (const e2 of e.children) {
            if (node.code == e2.refer) {
              this.todoItemSelectionToggle(checked, e2);
            }
            if (e2.children) {
              for (const e3 of e2.children) {
                if (node.code == e3.refer) {
                  this.todoItemSelectionToggle(checked, e3);
                }
              }
            }
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      groupUserName: ['', [Validators.required]],
    });

    if (this.isEdit) {
      this.title = 'Sửa nhóm người dùng';
      this.formGroup.patchValue({
        groupUserName: this.groupUser.userGroupName
      });
    } else {
      this.title = 'Thêm mới nhóm người dùng';
    }

    this.getAllPermission();
  }

  openNotifyDialog(title: string, content: string) {
    return this.dialog.open(NotifyDialogComponent, {
      width: '350px',
      disableClose: true,
      autoFocus: false,
      data: {
        title,
        content
      },
    });
  }

  getAllPermission() {
    this.groupUserService.getAllPermission()
      .subscribe(
        (data: any) => {
          this.listPermission = data.message;
          if (this.isEdit) {
            this.groupUserService.getAllPermissionByUserGroup(this.groupUser.id)
              .subscribe(
                (data2: any) => {
                  this.listPermissionByUser = data2.message;
                  this.buidlTree();
                },
                () => {
                  console.log('error to call api');
                }
              );
          } else {
            this.buidlTree();
          }
        },
        () => {
          console.log('error to call api');
        }
      );
  }

  buidlTree() {
    if (this.listPermission.length === 0) {
      return;
    }
    for (const e of this.listPermission) {
      const firstDigit = e.permissionCode.slice(0, 1);
      const secondDigit = e.permissionCode.slice(1, 2);
      const thirdDigit = e.permissionCode.slice(2, 3);
      if (secondDigit == 0 && thirdDigit == 0) {
        this.treeData.push(this.addRefer({
          name: e.permissionName,
          id: e.id,
          code: e.permissionCode,
          key: firstDigit,
          children: []
        }));
      }
    }
    for (const e of this.listPermission) {
      const firstDigit = e.permissionCode.slice(0, 1);
      const secondDigit = e.permissionCode.slice(1, 2);
      const thirdDigit = e.permissionCode.slice(2, 3);
      if (secondDigit != 0 && thirdDigit == 0) {
        for (const ele of this.treeData) {
          if (ele.key === firstDigit) {
            ele.children.push(this.addRefer({
              name: e.permissionName,
              id: e.id,
              code: e.permissionCode,
              key: secondDigit,
              children: []
            }));
            break;
          }
        }
      }
    }
    for (const e of this.listPermission) {
      const firstDigit = e.permissionCode.slice(0, 1);
      const secondDigit = e.permissionCode.slice(1, 2);
      const thirdDigit = e.permissionCode.slice(2, 3);
      if (secondDigit != 0 && thirdDigit != 0) {
        for (const ele of this.treeData) {
          if (ele.key === firstDigit) {
            for (const ele2 of ele.children) {
              if (ele2.key === secondDigit) {
                ele2.children.push(this.addRefer({
                  name: e.permissionName,
                  id: e.id,
                  code: e.permissionCode,
                  key: thirdDigit
                }));
                break;
              }
            }
            break;
          }
        }
      }
    }
    this.setDataSource();

    if (this.isEdit) {
      this.buildTreeForEdit();
    }
  }

  buildTreeForEdit() {
    const treeDataOld = [];
    if (this.listPermissionByUser.length === 0) {
      return;
    }
    for (const e of this.listPermissionByUser) {
      const firstDigit = e.permissionCode.slice(0, 1);
      const secondDigit = e.permissionCode.slice(1, 2);
      const thirdDigit = e.permissionCode.slice(2, 3);
      if (secondDigit == 0 && thirdDigit == 0) {
        treeDataOld.push(this.addRefer({
          name: e.permissionName,
          id: e.id,
          code: e.permissionCode,
          key: firstDigit,
          children: []
        }));
      }
    }
    for (const e of this.listPermissionByUser) {
      const firstDigit = e.permissionCode.slice(0, 1);
      const secondDigit = e.permissionCode.slice(1, 2);
      const thirdDigit = e.permissionCode.slice(2, 3);
      if (secondDigit != 0 && thirdDigit == 0) {
        for (const ele of treeDataOld) {
          if (ele.key === firstDigit) {
            ele.children.push(this.addRefer({
              name: e.permissionName,
              id: e.id,
              code: e.permissionCode,
              key: secondDigit,
              children: []
            }));
            break;
          }
        }
      }
    }
    for (const e of this.listPermissionByUser) {
      const firstDigit = e.permissionCode.slice(0, 1);
      const secondDigit = e.permissionCode.slice(1, 2);
      const thirdDigit = e.permissionCode.slice(2, 3);
      if (secondDigit != 0 && thirdDigit != 0) {
        for (const ele of treeDataOld) {
          if (ele.key === firstDigit) {
            for (const ele2 of ele.children) {
              if (ele2.key === secondDigit) {
                ele2.children.push(this.addRefer({
                  name: e.permissionName,
                  id: e.id,
                  code: e.permissionCode,
                  key: thirdDigit
                }));
                break;
              }
            }
            break;
          }
        }
      }
    }
    for (const e of treeDataOld) {
      for (const e1 of this.treeData) {
        if (e.key == e1.key) {
          if (e.children.length == e1.children.length) {
            let isSelected = true;
            for (const subE of e.children) {
              for (const subE1 of e1.children) {
                if (subE.key == subE1.key) {
                  if (subE.children.length == subE1.children.length) {
                    isSelected = false;
                  }
                }
              }
            }
            if (isSelected) {
              e1.selected = true;
            } else {
              e1.indeterminate = true;
            }
          } else {
            e1.indeterminate = true;
          }
          for (const e2 of e.children) {
            for (const e3 of e1.children) {
              if (e2.key == e3.key) {
                if (e2.children.length == e3.children.length) {
                  e3.selected = true;
                } else {
                  e3.indeterminate = true;
                }
                for (const e4 of e2.children) {
                  for (const e5 of e3.children) {
                    if (e4.key == e5.key) {
                      e5.selected = true;
                    }
                  }
                }
              }
            }
          }
          break;
        }
      }
    }
  }

  addRefer(ele: PermissionNode) {
    ele.refer = null;
    if (ele.code == 'A16') {
      ele.refer = 'E40';
    }
    if (ele.code == 'A21') {
      ele.refer = 'E10';
    }
    if (ele.code == 'A31') {
      ele.refer = 'A13';
    }
    if (ele.code == 'A35') {
      ele.refer = 'E10';
    }
    if (ele.code == 'A41') {
      ele.refer = 'A13';
    }
    if (ele.code == 'A42') {
      ele.refer = 'E10';
    }
    return ele;
  }

  submit() {
    const groupUserName = this.formGroup.get('groupUserName').value.trim();
    if (groupUserName == '') {
      this.openNotifyDialog('Lỗi', 'Không được để trống tên nhóm người dùng');
      return;
    }

    if (this.isEdit) {
      for (const groupUser of this.listGroupUser) {
        if (groupUser.userGroupName == groupUserName && groupUser.id != this.itemId) {
          this.openNotifyDialog('Lỗi', 'Không thể sửa nhóm người dùng, tên nhóm người dùng đã tồn tại');
          return;
        }
      }
    } else {
      for (const groupUser of this.listGroupUser) {
        if (groupUser.userGroupName == groupUserName) {
          this.openNotifyDialog('Lỗi', 'Không thể thêm mới, tên nhóm người dùng đã tồn tại');
          return;
        }
      }
    }
    let result = [];
    this.dataSource.data.forEach(node => {
      const temp = this.treeControl.getDescendants(node)
        .filter(x => (x.selected || x.indeterminate) && x.id)
        .map(x => x.id);
      if (temp.length != 0) {
        result.push(node.id);
      }
      result = result.concat(temp);
    });
    this.dialogRef.close({
      groupUserName,
      result
    });
  }
}
