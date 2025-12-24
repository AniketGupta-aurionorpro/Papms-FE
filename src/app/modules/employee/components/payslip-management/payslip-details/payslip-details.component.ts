import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeService } from '../../../../../services/employee.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PayrollPaymentResponse } from '../../../../../models/employee.models';

@Component({
  selector: 'app-payslip-details',
  templateUrl: './payslip-details.component.html',
  styleUrls: ['./payslip-details.component.css'],
  standalone: false
})
export class PayslipDetailsComponent implements OnInit {
  isLoading = true;
  isDownloading = false;
  error = '';
  payslip: PayrollPaymentResponse | null = null;
  paymentId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.paymentId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPayslipDetails();
  }

  loadPayslipDetails(): void {
    this.isLoading = true;
    this.error = '';

    this.employeeService.getPayslipDetails(this.paymentId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.payslip = data;
        },
        error: (err) => {
          this.error = 'Failed to load payslip details';
          this.notificationService.showError(this.error);
        }
      });
  }

  downloadPayslip(): void {
    this.isDownloading = true;

    this.employeeService.downloadPayslip(this.paymentId)
      .pipe(finalize(() => this.isDownloading = false))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payslip-${this.paymentId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.showSuccess('Payslip downloaded successfully!');
        },
        error: (err) => {
          this.notificationService.showError('Failed to download payslip');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/employee/payslips']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-900/50 text-green-400 border-green-700/50';
      case 'PENDING':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
      case 'FAILED':
        return 'bg-red-900/50 text-red-400 border-red-700/50';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    }
  }
}
