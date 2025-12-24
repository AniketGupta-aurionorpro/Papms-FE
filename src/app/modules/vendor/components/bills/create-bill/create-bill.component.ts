import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { VendorBillService } from '../../../../../services/vendor-bill.service';
import { CreateBillRequest, BillItem } from '../../../../../models/vendor-bill.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component';


@Component({
    selector: 'app-create-bill',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
    templateUrl: './create-bill.component.html',
    styleUrls: ['./create-bill.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateBillComponent implements OnInit {
    billForm!: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private billService: VendorBillService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 30); // Default due date: 30 days

        this.billForm = this.fb.group({
            description: ['', [Validators.required, Validators.minLength(10)]],
            dueDate: [tomorrow.toISOString().split('T')[0], Validators.required],
            items: this.fb.array([this.createItemFormGroup()])
        });
    }

    createItemFormGroup(): FormGroup {
        return this.fb.group({
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]]
        });
    }

    get items(): FormArray {
        return this.billForm.get('items') as FormArray;
    }

    addItem(): void {
        this.items.push(this.createItemFormGroup());
    }

    removeItem(index: number): void {
        if (this.items.length > 1) {
            this.items.removeAt(index);
        }
    }

    getItemAmount(index: number): number {
        const item = this.items.at(index);
        return (item.get('quantity')?.value || 0) * (item.get('unitPrice')?.value || 0);
    }

    getTotalAmount(): number {
        let total = 0;
        for (let i = 0; i < this.items.length; i++) {
            total += this.getItemAmount(i);
        }
        return total;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    onSubmit(): void {
        if (this.billForm.invalid) {
            this.billForm.markAllAsTouched();
            this.notificationService.showError('Please fill all required fields');
            return;
        }

        if (this.getTotalAmount() <= 0) {
            this.notificationService.showError('Bill amount must be greater than zero');
            return;
        }

        const formValue = this.billForm.value;
        const billItems: BillItem[] = formValue.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice
        }));

        const request: CreateBillRequest = {
            amount: this.getTotalAmount(),
            description: formValue.description,
            dueDate: formValue.dueDate,
            items: billItems
        };

        this.isSubmitting = true;
        this.billService.createBill(request)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe({
                next: () => {
                    this.notificationService.showSuccess('Bill created successfully!');
                    this.router.navigate(['/vendor/bills/history']);
                },
                error: (err) => {
                    this.notificationService.showError(err.error?.message || 'Failed to create bill');
                }
            });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.billForm.get(fieldName);
        return !!(field && field.invalid && field.touched);
    }
}
