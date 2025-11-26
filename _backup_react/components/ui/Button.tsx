import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    icon?: string;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    icon,
    children,
    className = '',
    fullWidth = false,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary",
        secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
        ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
        outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500"
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
            {...props}
        >
            {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
            {children}
        </button>
    );
};
