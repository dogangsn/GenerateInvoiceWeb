import React, { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                {description && <p className="text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
        </div>
    );
};
