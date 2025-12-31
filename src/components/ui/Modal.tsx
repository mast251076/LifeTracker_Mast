"use client";

import React, { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function ModalTrigger({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <div onClick={onClick} className="inline-block cursor-pointer">
            {children}
        </div>
    );
}
