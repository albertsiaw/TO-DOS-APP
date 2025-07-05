import React from 'react';

const DialogContent = ({ children, className = '' }) => (
    <div className={`py-4 ${className}`}>{children}</div>
);

export default DialogContent;
