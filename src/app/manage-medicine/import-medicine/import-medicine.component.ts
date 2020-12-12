import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { GroupMedicineService } from 'src/app/core/service/group-medicine.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SupplierService } from 'src/app/core/service/supplier.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { oneDot, propValToString } from 'src/app/shared/share-func';

@Component({
  selector: 'app-import-medicine',
  templateUrl: './import-medicine.component.html',
  styleUrls: ['./import-medicine.component.scss']
})
export class ImportMedicineComponent implements OnInit {
  autoByName = [];
  autoByPhone = [];
  autoByReceiptName = [];

  timer;
  supplierForm: FormGroup;

  listGroupMaterial = [];
  listGroupMedicine = [];
  lstReceiptDetails = [];

  listUnitName = ['Hộp', 'Lọ', 'Viên', 'Tuýp', 'Vỉ'];
  type = [{
    id: 1,
    name: 'Thuốc'
  },
  {
    id: 2,
    name: 'Vật tư'
  },
  ];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private supplierService: SupplierService,
    private groupMedicineService: GroupMedicineService,
    private router: Router,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private credentialsService: CredentialsService,
  ) {
    this.menuService.reloadMenu.subscribe(() => {
      const listPermission = route.snapshot.data.permissionCode;
      const newListPermission = this.credentialsService.credentials.permissionCode;
      for (const e of listPermission) {
        const index = newListPermission.findIndex(x => x == e);
        if (index == -1) {
          location.reload();
        }
      }
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Nhập thuốc, vật tư');

    if ('/manage-medicine/import-medicine' === this.router.url) {
      this.sideMenuService.changeItem(2.1);
    }
    if ('/manage-material/import-material' === this.router.url) {
      this.sideMenuService.changeItem(3.1);
    }
    this.supplierForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      supplierName: ['', [Validators.required]],
      address: [''],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      email: [''],
      accountNumber: [''],
      debt: [0],
      totalAmount: [0],
      amountPaid: [0],
      unpaiAmount: [0]
    });
    this.supplierForm.get('unpaiAmount').disable();
    this.supplierForm.get('totalAmount').disable();
    this.supplierForm.get('debt').disable();
    this.getAllGroupMaterial();
    this.getListGroupMedicine();
    const interval = setInterval(() => {
      if (this.listGroupMaterial.length !== 0 && this.listGroupMedicine.length !== 0) {
        this.addRow();
        clearInterval(interval);
      }
    }, 1000);
  }

  oneDot(item) {
    return oneDot(item);
  }

  resetInput() {
    this.autoByName = [];
    this.autoByPhone = [];
    this.autoByReceiptName = [];
    this.lstReceiptDetails = [];
    this.supplierForm.patchValue({
      id: '',
      supplierName: '',
      address: '',
      phone: '',
      email: '',
      accountNumber: '',
      debt: 0,
      totalAmount: 0,
      amountPaid: 0,
      unpaiAmount: 0
    }
    );
    this.caculateTotal();
  }
  autoSelected(event: any) {
    this.resetInput();
    event = propValToString(event);
    event.debt = event.debt ? oneDot(event.debt) : 0;
    this.supplierForm.patchValue(event);
    this.caculateTotal();
  }
  generateByReceiptName(event: any, text): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = text.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.supplierService.searchByReceiptName(value).subscribe(
        (data: any) => {
          this.autoByReceiptName = data.message;
        }, (error) => {
          console.log('auto failed');
        }
      );
    }, 500);
  }

  generateByName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.supplierForm.get('supplierName').value.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.supplierService.searchByName(value).subscribe(
        (data: any) => {
          this.autoByName = data.message;
        }, (error) => {
          console.log('auto failed');
        }
      );
    }, 500);
  }
  generateByPhone(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.supplierForm.get('phone').value.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.supplierService.searchByPhone(value).subscribe(
        (data: any) => {
          this.autoByPhone = data.message;
        }, (error) => {
          console.log('auto failed');
        }
      );
    }, 500);
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

  getAllGroupMaterial() {
    this.supplierService.getAllGroupMaterial().subscribe(
      (data: any) => {
        if (data.message) {
          this.listGroupMaterial = data.message;
        }
      },
      (error) => {
        this.openNotifyDialog('Lỗi', 'Tải danh sách loại thất bại.');
      }
    );
  }
  getListGroupMedicine() {
    this.groupMedicineService.getAllGroupMedicine()
      .subscribe(
        (data: any) => {
          if (data.message.length !== 0) {
            this.listGroupMedicine = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Tải danh sách nhóm thuốc thất bại.');
        }
      );
  }

  addRow() {
    const template = {
      medicineId: null,
      materialId: null,
      quantityDetail: 1,
      amountDetail: 0,
      receiptName: '',
      price: 0,
      unitName: 'Hộp',
      groupMedicineId: this.listGroupMedicine[0].id,
      groupMaterialId: this.listGroupMaterial[0].id,
      type: 1
    };
    this.lstReceiptDetails.push(template);
    const boxTable = document.querySelector('.table-custom .table-content');
    setTimeout(() => {
      boxTable.scrollTop = boxTable.scrollHeight;
    }, 50);
  }

  caculateTotal() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let amountPaid = this.supplierForm.get('amountPaid').value;
      if (!amountPaid) {
        amountPaid = 0;
      }
      let total = 0;
      this.lstReceiptDetails.forEach(element => {
        total += (element.quantityDetail * element.amountDetail);
      });
      if (amountPaid < 0) {
        amountPaid = 0;
      }
      if (amountPaid > total) {
        amountPaid = total;
      }
      this.supplierForm.patchValue({
        totalAmount: oneDot(total),
        unpaiAmount: oneDot(total - amountPaid),
        amountPaid
      });
    }, 300);
  }



  save() {
    const dataPost = {
      supplierId: this.supplierForm.get('id').value.trim() ? this.supplierForm.get('id').value.trim() : null,
      receiptId: null,
      totalAmount: parseInt(this.supplierForm.get('totalAmount').value.replace(/,/gmi, ''), 10),
      amountPaid: this.supplierForm.get('amountPaid').value,
      supplierName: this.supplierForm.get('supplierName').value.trim(),
      address: this.supplierForm.get('address').value.trim(),
      phone: this.supplierForm.get('phone').value.trim(),
      email: this.supplierForm.get('email').value.trim(),
      accountNumber: this.supplierForm.get('accountNumber').value.trim(),
      debt: this.supplierForm.get('debt').value,
      lstReceiptDetails: null
    };
    if (!dataPost.totalAmount) {
      dataPost.totalAmount = 0;
    }
    if (!dataPost.amountPaid) {
      dataPost.amountPaid = 0;
    }
    if (!dataPost.debt) {
      dataPost.debt = 0;
    }
    if (dataPost.supplierName === '') {
      this.openNotifyDialog('Lỗi', 'Tên nhà cung cấp không được để trống');
      return;
    }
    if (dataPost.phone === '') {
      this.openNotifyDialog('Lỗi', 'Số điện thoại nhà cung cấp không được để trống');
      return;
    }
    if (dataPost.phone.length !== 10 || !(/^\d+$/.test(dataPost.phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }
    if (dataPost.email !== '' && !(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(dataPost.email))) {
      this.openNotifyDialog('Lỗi', 'Email không đúng định dạng');
      return;
    }

    const listReceipt = JSON.parse(JSON.stringify(this.lstReceiptDetails));
    for (const iterator of listReceipt) {
      if (iterator.type === 1) {
        iterator.groupMaterialId = null;
      } else {
        iterator.groupMedicineId = null;
      }
      if (iterator.receiptName.trim() === '') {
        this.openNotifyDialog('Lỗi', 'Bạn phải điền tên cho toàn bộ thuốc, vật tư.');
        return;
      }
      if (iterator.quantityDetail > 10000) {
        this.openNotifyDialog('Lỗi', 'Thuốc, vật tư có thể nhập tối đa là 10.000 đơn vị.');
        return;
      }
      if (iterator.quantityDetail <= 0) {
        this.openNotifyDialog('Lỗi', 'Thuốc, vật tư phải lớn hơn 0.');
        return;
      }
      if (iterator.amountDetail < 0) {
        this.openNotifyDialog('Lỗi', 'Giá nhập các thuốc/vật tư không thể nhỏ hơn 0.');
        return;
      }
      if (iterator.price < 0) {
        this.openNotifyDialog('Lỗi', 'Giá bán các thuốc/vật tư không thể nhỏ hơn 0.');
        return;
      }
      delete iterator.type;
    }
    dataPost.lstReceiptDetails = listReceipt;

    if (dataPost.lstReceiptDetails.length === 0) {
      this.openNotifyDialog('Lỗi', 'Danh sách nhập thuốc vật tư đang không có dữ liệu.');
      return;
    }

    this.supplierService.updateReceipt(dataPost).subscribe(
      (data: any) => {
        if (data.message) {
          this.openNotifyDialog('Thông báo', 'Lưu thông tin thành công.');
        }
      },
      (error) => {
        this.openNotifyDialog('Lỗi', 'Lưu thông tin thất bại.');

      }
    );

  }

  deleteItem(index) {
    this.lstReceiptDetails.splice(index, 1);
    this.caculateTotal();
  }
}
