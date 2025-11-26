import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.css'
})
export class ButtonComponent {
    @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' = 'primary';
    @Input() icon?: string;
    @Input() fullWidth = false;
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;

    @Output() onClick = new EventEmitter<Event>();

    get buttonClasses(): string {
        const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary",
            secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500",
            danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
            ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
            outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500"
        };

        const widthClass = this.fullWidth ? 'w-full' : '';

        return `${baseStyles} ${variants[this.variant]} ${widthClass}`;
    }

    handleClick(event: Event) {
        if (!this.disabled) {
            this.onClick.emit(event);
        }
    }
}
