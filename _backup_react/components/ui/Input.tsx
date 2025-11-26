import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-900">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`w-full rounded-lg border border-slate-300 py-3 ${icon ? 'pl-10' : 'px-3'} text-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-slate-100 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    {...props}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};
