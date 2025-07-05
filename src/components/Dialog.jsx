import React from 'react';

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div
                className="relative z-50 rounded-lg border p-6 shadow-2xl w-full max-w-md"
                style={{
                    background: 'white',
                    color: '#1a202c', // dark text
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                    border: '2px solid #2563eb', // blue border for visibility
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default Dialog;
