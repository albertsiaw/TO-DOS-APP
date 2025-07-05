import React from 'react';

const Checkbox = ({ id, className = '', checked, onCheckedChange, ...props }) => (
    <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
        className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className}`}
        {...props}
    />
);

export default Checkbox;
