"use client";

import * as React from "react";

export function Dialog({ children }: any) {
    return <div data-dialog-root>{children}</div>;
}

export function DialogTrigger({ children, asChild }: any) {
    return <div data-dialog-trigger style={{ display: 'inline-block' }} onClick={(e) => {
        console.log('Dialog Trigger Click');
        // We can't actually open the dialog without state, but if we render this, we pass the crash test
    }}>{children}</div>;
}

export function DialogContent({ children, className }: any) {
    // Render this unconditionally for debug
    return (
        <div style={{ padding: 20, border: '5px solid blue', background: 'white', position: 'fixed', top: 100, left: 100, zIndex: 9999 }}>
            <h1>DUMMY DIALOG NO DEPS</h1>
            {children}
        </div>
    );
}

export function DialogHeader({ children }: any) {
    return <div>{children}</div>;
}

export function DialogTitle({ children }: any) {
    return <h3>{children}</h3>;
}
