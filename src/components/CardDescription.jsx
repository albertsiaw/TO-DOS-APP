import React from 'react';

const CardDescription = ({ children, className = '', ...props }) => (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
        {children}
    </p>
);

export default CardDescription;
