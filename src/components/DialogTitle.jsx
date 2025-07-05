import React from 'react';

const DialogTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h3>
);

export default DialogTitle;
