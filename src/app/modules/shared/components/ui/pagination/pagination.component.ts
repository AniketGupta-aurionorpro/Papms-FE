import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// This defines the structure of the event emitted on page change
export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;
  @Input() currentPage: number = 0; // --- FIX: ADDED CURRENT PAGE INPUT ---
  @Output() onPageChange = new EventEmitter<PageEvent>();

  pages: number[] = [];
  totalPages: number = 0;
  firstRecordOnPage: number = 0;
  lastRecordOnPage: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalRecords'] || changes['rows'] || changes['currentPage']) {
      // --- FIX: Recalculate pagination when any relevant input changes ---
      this.calculatePagination();
    }
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pages = this.generatePageNumbers();
    this.updatePageInfo();
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }
    // The internal state is now driven by the input, but we emit the change event
    this.emitPageChangeEvent(page);
  }

  private updatePageInfo(): void {
    this.firstRecordOnPage = this.totalRecords > 0 ? this.currentPage * this.rows + 1 : 0;
    this.lastRecordOnPage = Math.min((this.currentPage + 1) * this.rows, this.totalRecords);
  }

  private emitPageChangeEvent(page: number): void {
    this.onPageChange.emit({
      first: page * this.rows + 1,
      rows: this.rows,
      page: page,
      pageCount: this.totalPages
    });
  }

  // NEW: More intelligent page number generation for large datasets
  private generatePageNumbers(): number[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }

    const pagesToShow = [];
    pagesToShow.push(0); // always show first page

    if (this.currentPage > 2) {
      pagesToShow.push(-1); // represents '...'
    }

    const startPage = Math.max(1, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 2, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }

    if (this.currentPage < this.totalPages - 3) {
      pagesToShow.push(-1); // represents '...'
    }

    pagesToShow.push(this.totalPages - 1); // always show last page
    return pagesToShow;
  }


  isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages - 1;
  }
}
