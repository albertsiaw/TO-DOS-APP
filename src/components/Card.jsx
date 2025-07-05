import React from 'react';

const Card = ({ children, className = '', ...props }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
