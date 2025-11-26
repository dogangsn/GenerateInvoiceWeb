import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent],
    template: `
    <div class="flex h-screen w-full bg-background-light text-slate-800">
      <app-sidebar></app-sidebar>
      <main class="h-screen flex-1 overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`:host { display: block; }`]
})
export class MainLayoutComponent { }
