import React from 'react';

const DialogHeader = ({ children, className = '' }) => (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}>
        {children}
    </div>
);

export default DialogHeader;
