'use client';
import { X } from 'lucide-react';
import React, { ReactNode } from 'react';
import clsx from 'clsx';

type BaseModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    children: ReactNode;
    headerAction?: ReactNode;
    iconClassName?: string; // Optional custom wrapper style
    maxWidth?: string;
};

export function BaseModal({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    headerAction,
    iconClassName = "bg-gray-50 text-gray-600", // Default gray style
    maxWidth = "max-w-md",
}: BaseModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className={clsx("bg-white w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100/50", maxWidth)}>

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className={clsx("p-1.5 rounded-xl", iconClassName)}>
                                {icon}
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-[10px] text-gray-500">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {headerAction}
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
