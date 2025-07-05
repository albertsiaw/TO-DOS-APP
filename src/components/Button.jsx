import React from 'react';

const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
    let baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    let variantStyles = '';
    let sizeStyles = '';

    switch (variant) {
        case 'default':
            variantStyles = 'bg-blue-600 text-white shadow hover:bg-blue-700';
            break;
        case 'outline':
            variantStyles = 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground';
            break;
        case 'destructive':
            variantStyles = 'bg-red-600 text-white shadow-sm hover:bg-red-700';
            break;
        case 'ghost':
            variantStyles = 'hover:bg-accent hover:text-accent-foreground';
            break;
        case 'link':
            variantStyles = 'text-blue-600 underline-offset-4 hover:underline';
            break;
        case 'secondary':
            variantStyles = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
            break;
    }

    switch (size) {
        case 'default':
            sizeStyles = 'h-9 px-4 py-2';
            break;
        case 'sm':
            sizeStyles = 'h-8 rounded-md px-3 text-xs';
            break;
        case 'lg':
            sizeStyles = 'h-10 rounded-md px-8';
            break;
        case 'icon':
            sizeStyles = 'h-9 w-9';
            break;
    }

    return (
        <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
