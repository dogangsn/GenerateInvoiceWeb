import React, { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', action }) => {
    return (
        <div className={`rounded-xl bg-white p-6 shadow-sm ${className}`}>
            {(title || action) && (
                <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
                    {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
