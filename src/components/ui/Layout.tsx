"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, FileText, Home, PieChart, Lock, Menu, Settings, Shield, TrendingUp, TrendingDown, Code } from 'lucide-react';
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
        { name: 'Command Dashboard', href: '/', icon: Home },
        { name: 'Asset Matrix', href: '/assets', icon: PieChart },
        { name: 'Liability Ledger', href: '/liabilities', icon: Cloud },
        { name: 'Doc Repository', href: '/documents', icon: FileText },
        { name: 'Secure Vault', href: '/vault', icon: Lock },
        { name: 'Inflow Architecture', href: '/income', icon: TrendingUp },
        { name: 'Entropy Log', href: '/expenses', icon: TrendingDown },
        { name: 'Future Projections', href: '/retirement', icon: Shield },
        { name: 'App Settings', href: '/settings', icon: Settings },
        { name: 'System Parameters', href: '/config', icon: Code },
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
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col border-r border-white/5 bg-[#0a0c10] transition-all duration-500 ease-in-out`}
            >
                <div className="flex items-center h-16 px-6 mb-2">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <Menu className="h-4 w-4 text-primary" />
                    </button>
                    {isSidebarOpen && (
                        <div className="ml-3 flex flex-col items-start animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="font-extrabold text-lg tracking-tighter bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent italic">LifeTracker</span>
                            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-black leading-none opacity-60">Intelligence</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className="block group">
                                <div
                                    className={`relative w-full flex items-center p-2.5 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon className={`h-4 w-4 mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    {isSidebarOpen && (
                                        <span className="font-medium text-[13px] tracking-tight transition-opacity duration-300">
                                            {item.name}
                                        </span>
                                    )}
                                    {isActive && <div className="absolute left-0 h-4 w-1 rounded-r-full bg-primary" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {isSidebarOpen && userData && (
                    <div className="p-3 m-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center space-x-2.5">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                                {getInitials(userData.name)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[12px] font-bold text-white truncate">{userData.name}</span>
                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Enterprise</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 border-b border-white/5 bg-background/50 backdrop-blur-xl z-10">
                    <div className="flex items-center md:hidden">
                        <span className="font-extrabold text-lg tracking-tighter italic">LifeTracker</span>
                    </div>
                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="h-9 w-full rounded-lg bg-white/5 border border-white/5 flex items-center px-3 text-muted-foreground text-xs font-medium">
                            Search Intelligence...
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none opacity-60">Auth Level</p>
                            <p className="text-[11px] font-bold text-green-500/80 flex items-center justify-end mt-1">
                                <Shield className="h-3 w-3 mr-1" />
                                Tier-1 High
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group">
                            <Settings className="h-4 w-4 text-muted-foreground group-hover:rotate-45 transition-transform" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-[#050608] custom-scrollbar">
                    <div className="mx-auto max-w-full p-6 lg:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
