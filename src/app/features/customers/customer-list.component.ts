import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    customers: Customer[] = [];

    constructor(private customerService: CustomerService) { }

    ngOnInit(): void {
        this.customerService.getCustomers().subscribe(data => {
            this.customers = data;
        });
    }
}
