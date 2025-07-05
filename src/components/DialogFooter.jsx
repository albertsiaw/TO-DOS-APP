import React from 'react';

const DialogFooter = ({ children, className = '' }) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`}>
        {children}
    </div>
);

export default DialogFooter;
