"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Asset, RetirementAsset } from '@/types';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { RetirementForm } from '@/components/retirement/RetirementForm';
import { Shield, Plus, LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';

export default function RetirementPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
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

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this retirement scheme?')) {
            storage.deleteAsset(id);
            loadData();
        }
    };

    const openEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingAsset(null);
        setIsModalOpen(true);
    };

    if (!mounted) return null;

    const totalRetirement = assets.reduce((sum, a) => sum + a.currentValue.amount, 0);

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Retirement Intelligence</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <Shield className="h-3 w-3 mr-1.5" /> Long-term Corpus Architecture
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-lg border border-white/5">
                            <Button
                                variant={viewMode === 'GRID' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 w-7 p-0 rounded-md"
                                onClick={() => setViewMode('GRID')}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant={viewMode === 'LIST' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 w-7 p-0 rounded-md"
                                onClick={() => setViewMode('LIST')}
                            >
                                <List className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-wider shadow-none">
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Scheme Addition
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="glass-card group p-3 border-none border-l-2 border-l-blue-500/40">
                        <div className="flex items-center justify-between">
                            <span className="fin-label text-[9px]">Composite Corpus</span>
                            <Shield className="h-3 w-3 text-blue-500/40" />
                        </div>
                        <div className="mt-1">
                            <div className="text-xl fin-data text-blue-400">{formatCurrency(totalRetirement)}</div>
                        </div>
                    </Card>
                </div>

                {viewMode === 'GRID' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {assets.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                <Shield className="h-8 w-8 text-primary mx-auto mb-3 opacity-20" />
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">No Active Schemes</h3>
                            </div>
                        ) : (
                            assets.map((asset) => (
                                <Card key={asset.id} className="glass-card group p-3 border-none flex flex-col justify-between h-44 border-t-2 border-t-primary/20">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="min-w-0">
                                            <span className="fin-label text-[8px] truncate block opacity-50 mb-0.5">{(asset as any).details.schemeType}</span>
                                            <h3 className="text-xs font-black text-white truncate">{asset.name}</h3>
                                        </div>
                                        <Badge variant="outline" className="text-[7px] font-black uppercase tracking-tighter h-3.5 px-1 border-white/10">{asset.status}</Badge>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="text-lg fin-data text-primary">{formatCurrency(asset.currentValue.amount)}</div>

                                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                                            {(asset as any).details.schemeType === 'EPF' && (
                                                <div className="grid grid-cols-2 gap-2 text-[8px]">
                                                    <div>
                                                        <span className="text-white/30 block uppercase font-black">EE</span>
                                                        <span className="font-bold text-white/60">{formatCurrency((asset as any).details.employeeContribution?.amount || 0)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/30 block uppercase font-black">ER</span>
                                                        <span className="font-bold text-white/60">{formatCurrency((asset as any).details.employerContribution?.amount || 0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {(asset as any).details.schemeType === 'NPS' && (
                                                <div className="grid grid-cols-2 gap-2 text-[8px]">
                                                    <div>
                                                        <span className="text-white/30 block uppercase font-black">T1</span>
                                                        <span className="font-bold text-white/60">{formatCurrency((asset as any).details.tier1Balance?.amount || 0)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-white/30 block uppercase font-black">T2</span>
                                                        <span className="font-bold text-white/60">{formatCurrency((asset as any).details.tier2Balance?.amount || 0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-1">
                                        <button onClick={() => openEdit(asset)} className="flex-1 flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-tighter bg-white/5 py-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                            <Pencil className="h-2.5 w-2.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(asset.id)} className="px-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter text-white/20 hover:text-red-500 transition-all">
                                            <Trash2 className="h-2.5 w-2.5" /> Delete
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/10 border-b border-white/5">
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Scheme Node</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Reference</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Status</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Settlement value</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cmd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="zebra-row hover:bg-white/10 group h-10">
                                        <td className="px-4 py-0">
                                            <div className="flex items-center space-x-2">
                                                <div className="text-[11px] font-bold text-white/90">{asset.name}</div>
                                                <span className="text-[8px] font-black uppercase text-white/20">{(asset as any).details.schemeType}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-0">
                                            <div className="text-[9px] font-mono opacity-40 uppercase">{(asset as any).details.uan || (asset as any).details.pran || 'PRIMARY-NODE'}</div>
                                        </td>
                                        <td className="px-4 py-0">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-white/10 h-4 px-1 leading-none">
                                                {asset.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-0 text-right font-black tabular-nums text-primary text-[11px]">
                                            {formatCurrency(asset.currentValue.amount)}
                                        </td>
                                        <td className="px-4 py-0 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(asset)} className="p-1 hover:text-primary transition-all text-white/40 hover:text-white" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleDelete(asset.id)} className="p-1 hover:text-red-500 transition-all text-red-500/40 hover:text-red-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? "Edit Retirement Scheme" : "Add Retirement Scheme"}>
                    <RetirementForm
                        initialData={editingAsset as RetirementAsset || undefined}
                        onSuccess={() => {
                            setIsModalOpen(false);
                            setEditingAsset(null);
                            loadData();
                        }}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setEditingAsset(null);
                        }}
                    />
                </Modal>
            </div>
        </Layout>
    );
}
