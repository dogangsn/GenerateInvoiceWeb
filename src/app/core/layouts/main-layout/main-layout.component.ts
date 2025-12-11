import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
    template: `
    <div class="flex h-screen w-full bg-background-light text-slate-800">
      <app-sidebar></app-sidebar>
      <div class="flex flex-1 flex-col overflow-hidden">
        <app-header></app-header>
        <main class="flex-1 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: [`:host { display: block; }`]
})
export class MainLayoutComponent { }
