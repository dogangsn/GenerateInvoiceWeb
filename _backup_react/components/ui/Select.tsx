import React, { SelectHTMLAttributes } from 'react';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: (Option | string)[];
    error?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    className = '',
    id,
    ...props
}) => {
    const selectId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={className}>
            {label && (
                <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-slate-900">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-slate-100 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...props}
            >
                {options.map((opt, index) => {
                    const value = typeof opt === 'string' ? opt : opt.value;
                    const label = typeof opt === 'string' ? opt : opt.label;
                    return (
                        <option key={index} value={value}>
                            {label}
                        </option>
                    );
                })}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};
