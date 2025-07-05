import React from 'react';

const CardTitle = ({ children, className = '', ...props }) => (
    <h3 className={`font-semibold leading-none tracking-tight text-2xl ${className}`} {...props}>
        {children}
    </h3>
);

export default CardTitle;
