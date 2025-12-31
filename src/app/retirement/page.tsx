"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Asset } from '@/types';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { RetirementForm } from '@/components/retirement/RetirementForm';
import { Shield, Plus, LayoutGrid, List } from 'lucide-react';

export default function RetirementPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [mounted, setMounted] = useState(false);

    const loadData = () => {
        const data = storage.getAppData();
        if (data) {
            setAssets(data.assets.filter(a => a.type === 'RETIREMENT'));
        }
    };

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    if (!mounted) return null;

    const totalRetirement = assets.reduce((sum, a) => sum + a.currentValue.amount, 0);

    return (
        <Layout>
            <div className="flex flex-col space-y-6 animate-in fade-in duration-500 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">Retirement Planner</h2>
                        <p className="text-muted-foreground">Track your EPF, PPF, NPS, and long-term corpus.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-muted/40 p-1.5 rounded-xl border border-white/5">
                            <Button
                                variant={viewMode === 'GRID' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-9 w-9 p-0 rounded-lg"
                                onClick={() => setViewMode('GRID')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'LIST' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-9 w-9 p-0 rounded-lg"
                                onClick={() => setViewMode('LIST')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="glass-card h-11 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Add Scheme
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="glass-card border-none bg-blue-500/5 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-60">Total Corpus</CardTitle>
                            <Shield className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-blue-400 tabular-nums">{formatCurrency(totalRetirement)}</div>
                        </CardContent>
                    </Card>
                </div>

                {viewMode === 'GRID' ? (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {assets.length === 0 ? (
                            <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                                No retirement schemes found. Start planning your future.
                            </div>
                        ) : (
                            assets.map((asset) => (
                                <Card key={asset.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col pt-2">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-bold tracking-tight">{asset.name}</CardTitle>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">{(asset as any).details.schemeType} • {(asset as any).details.uan || (asset as any).details.pran || 'N/A'}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-muted/50 border-white/5 rounded-lg">{asset.status}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-black mb-4 tabular-nums text-primary">{formatCurrency(asset.currentValue.amount)}</div>

                                        {(asset as any).details.schemeType === 'EPF' && (
                                            <div className="grid grid-cols-2 gap-4 text-xs bg-black/20 p-4 rounded-xl border border-white/5">
                                                <div>
                                                    <span className="text-muted-foreground block text-[10px] font-black uppercase opacity-60 mb-1">Employee Contrib.</span>
                                                    <span className="font-bold tabular-nums">{formatCurrency((asset as any).details.employeeContribution?.amount || 0)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-[10px] font-black uppercase opacity-60 mb-1">Employer Contrib.</span>
                                                    <span className="font-bold tabular-nums">{formatCurrency((asset as any).details.employerContribution?.amount || 0)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {(asset as any).details.schemeType === 'NPS' && (
                                            <div className="grid grid-cols-2 gap-4 text-xs bg-black/20 p-4 rounded-xl border border-white/5">
                                                <div>
                                                    <span className="text-muted-foreground block text-[10px] font-black uppercase opacity-60 mb-1">Tier 1</span>
                                                    <span className="font-bold tabular-nums">{formatCurrency((asset as any).details.tier1Balance?.amount || 0)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block text-[10px] font-black uppercase opacity-60 mb-1">Tier 2</span>
                                                    <span className="font-bold tabular-nums">{formatCurrency((asset as any).details.tier2Balance?.amount || 0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="h-1 w-full bg-gradient-to-r from-primary/50 to-transparent absolute bottom-0" />
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="glass-card border-none rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-white/5">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Scheme</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID/PRAN</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{asset.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{(asset as any).details.schemeType}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-mono opacity-80">{(asset as any).details.uan || (asset as any).details.pran || '—'}</td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-muted/50">{asset.status}</Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="text-sm font-black tabular-nums">{formatCurrency(asset.currentValue.amount)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Retirement Scheme">
                    <RetirementForm
                        onSuccess={() => {
                            setIsModalOpen(false);
                            loadData();
                        }}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            </div>
        </Layout>
    );
}
