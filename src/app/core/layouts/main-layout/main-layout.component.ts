import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent],
    template: `
    <div class="flex flex-col md:flex-row h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      <!-- Mobile Topbar -->
      <header class="flex md:hidden items-center justify-between h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shrink-0">
        <div class="flex items-center gap-2 text-primary">
          <span class="material-symbols-outlined text-2xl">receipt_long</span>
          <span class="text-lg font-black tracking-tight text-slate-900 dark:text-white">Fatura<span class="text-primary">Pro</span></span>
        </div>
        <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined text-2xl">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </header>

      <!-- Sidebar Drawer / Desktop Sidebar -->
      <app-sidebar [isOpen]="isMobileMenuOpen" (closeMobileMenu)="isMobileMenuOpen = false"></app-sidebar>

      <!-- Main Content Area -->
      <main class="flex-1 h-[calc(100vh-3.5rem)] md:h-screen overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`:host { display: block; }`]
})
export class MainLayoutComponent {
    isMobileMenuOpen = false;
}

