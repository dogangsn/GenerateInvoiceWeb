import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-slate-900">Panel</h1>
      <p class="text-slate-500">Hoşgeldiniz!</p>
    </div>
  `,
    styles: [`:host { display: block; }`]
})
export class DashboardComponent { }
