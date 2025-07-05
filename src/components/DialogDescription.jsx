import React from 'react';

const DialogDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-muted-foreground ${className}`}>
        {children}
    </p>
);

export default DialogDescription;
