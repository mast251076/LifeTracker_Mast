"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, FileText, Home, PieChart, Lock, Menu, Settings, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userData, setUserData] = useState<{ name: string } | null>(null);

    useEffect(() => {
        const data = storage.getAppData();
        if (data && data.profile && data.profile.name) {
            setUserData(data.profile);
        }
    }, [pathname]);

    const navigation = [
        { name: 'Core Overview', href: '/', icon: Home },
        { name: 'Wealth Assets', href: '/assets', icon: PieChart },
        { name: 'Liabilities', href: '/liabilities', icon: Cloud },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Secure Vault', href: '/vault', icon: Lock },
        { name: 'Income Stream', href: '/income', icon: TrendingUp },
        { name: 'Expense Log', href: '/expenses', icon: TrendingDown },
        { name: 'Retirement', href: '/retirement', icon: Shield },
        { name: 'App Settings', href: '/settings', icon: Settings },
    ];

    const getInitials = (name: string) => {
        if (!name) return '??';
        try {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        } catch (e) {
            return '??';
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-24'} hidden md:flex flex-col border-r border-white/5 bg-[#0a0c10] transition-all duration-500 ease-in-out`}
            >
                <div className="flex items-center h-20 px-6 mb-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <Menu className="h-5 w-5 text-primary" />
                    </button>
                    {isSidebarOpen && (
                        <div className="ml-4 flex flex-col items-start animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="font-extrabold text-xl tracking-tighter bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">LifeTracker</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold leading-none">Intelligence</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className="block group">
                                <div
                                    className={`relative w-full flex items-center p-3 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    {isSidebarOpen && (
                                        <span className="font-semibold text-sm tracking-tight transition-opacity duration-300">
                                            {item.name}
                                        </span>
                                    )}
                                    {isActive && <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {isSidebarOpen && userData && (
                    <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
                                {getInitials(userData.name)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white truncate max-w-[120px]">{userData.name}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">Standard Plan</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-20 px-8 border-b border-white/5 bg-background/50 backdrop-blur-xl z-10">
                    <div className="flex items-center md:hidden">
                        <span className="font-extrabold text-xl tracking-tighter">LifeTracker</span>
                    </div>
                    <div className="flex-1 max-w-xl mx-8 hidden md:block">
                        {/* Search or breadcrumbs could go here */}
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Profile Status</p>
                            <p className="text-xs font-semibold text-green-500 flex items-center justify-end mt-1">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified Secured
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group">
                            <Settings className="h-5 w-5 text-muted-foreground group-hover:rotate-45 transition-transform" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-[#050608] custom-scrollbar">
                    <div className="mx-auto max-w-7xl p-8 lg:p-12">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
