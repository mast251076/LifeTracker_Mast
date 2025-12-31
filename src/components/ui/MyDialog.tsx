"use client";

import * as React from "react";

export function MyDialog({ children }: any) {
    return <div data-my-dialog-root>{children}</div>;
}

export function MyDialogTrigger({ children }: any) {
    return <div data-my-dialog-trigger style={{ cursor: 'pointer' }} onClick={() => console.log('MyDialog Click')}>{children}</div>;
}

export function MyDialogContent({ children }: any) {
    return (
        <div style={{ padding: 20, border: '5px solid purple', background: '#eee', position: 'fixed', top: 50, left: 50, zIndex: 10000 }}>
            <h1>MY DIALOG (RENAMED)</h1>
            {children}
        </div>
    );
}

export function MyDialogHeader({ children }: any) {
    return <div>{children}</div>;
}

export function MyDialogTitle({ children }: any) {
    return <h3>{children}</h3>;
}
