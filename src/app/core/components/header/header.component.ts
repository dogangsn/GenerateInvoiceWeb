import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
        <!-- Left Side - Page Title -->
        <div class="flex items-center gap-4">
            <h2 class="text-lg font-semibold text-slate-900">Hoş geldiniz!</h2>
        </div>

        <!-- Right Side - User Info -->
        <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <span class="material-symbols-outlined">notifications</span>
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- User Menu -->
            <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                @if (user$ | async; as user) {
                    <img 
                        [src]="user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || user.email)" 
                        [alt]="user.displayName || 'Kullanıcı'"
                        class="w-9 h-9 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div class="hidden md:block">
                        <p class="text-sm font-medium text-slate-900">{{ user.displayName || 'Kullanıcı' }}</p>
                        <p class="text-xs text-slate-500">{{ user.email }}</p>
                    </div>
                }
                
                <!-- Logout Button -->
                <button 
                    (click)="logout()"
                    class="ml-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Çıkış Yap"
                >
                    <span class="material-symbols-outlined">logout</span>
                </button>
            </div>
        </div>
    </header>
    `,
    styles: [`:host { display: block; }`]
})
export class HeaderComponent {
    private authService = inject(AuthService);
    user$ = this.authService.user$;

    async logout() {
        await this.authService.logout();
    }
}



