import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private platformId = inject(PLATFORM_ID);
    currentTheme = signal<Theme>('light');

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const saved = localStorage.getItem('theme') as Theme;
            if (saved === 'dark' || saved === 'light') {
                this.setTheme(saved);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark');
            }
        }
    }

    setTheme(theme: Theme): void {
        this.currentTheme.set(theme);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('theme', theme);
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    toggleTheme(): void {
        this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
    }

    get theme(): Theme {
        return this.currentTheme();
    }

    get isDark(): boolean {
        return this.currentTheme() === 'dark';
    }
}
