import { MatPaginatorIntl } from '@angular/material/paginator';

const vietnameseRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
        return `0 trong số ${length}`;
    }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} trong số ${length}`;
};


export function getVietnamesePaginatorIntl(): MatPaginatorIntl {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.itemsPerPageLabel = 'Số mục trên mỗi trang:';
    paginatorIntl.nextPageLabel = 'Trang tiếp';
    paginatorIntl.previousPageLabel = 'Trang trước';
    paginatorIntl.firstPageLabel = 'Trang đầu';
    paginatorIntl.lastPageLabel = 'Trang cuối';
    paginatorIntl.getRangeLabel = vietnameseRangeLabel;

    return paginatorIntl;
}