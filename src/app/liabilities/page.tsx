"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LiabilityForm } from '@/components/liabilities/LiabilityForm';
import { storage } from '@/lib/storage';
import { Plus, LayoutGrid, List, Cloud, Pencil, Trash2 } from 'lucide-react';
import { Liability } from '@/types';

export default function LiabilitiesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

    // Explicitly define loadData to be accessible
    const loadData = () => {
        try {
            const data = storage.getAppData();
            if (data) {
                setLiabilities(data.liabilities || []);
            }
        } catch (e: any) {
            console.error("Failed to load data", e);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = (liabilityData: Liability) => {
        if (editingLiability) {
            storage.updateLiability(liabilityData);
        } else {
            const currentData = storage.getAppData();
            storage.saveAppData({
                ...currentData,
                liabilities: [...currentData.liabilities, liabilityData]
            });
        }
        setIsModalOpen(false);
        setEditingLiability(null);
        loadData();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this liability?')) {
            storage.deleteLiability(id);
            loadData();
        }
    };

    const openEdit = (liability: Liability) => {
        setEditingLiability(liability);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingLiability(null);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Debt Intelligence</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <Cloud className="h-3 w-3 mr-1.5" /> Liability Exposure Index
                        </p>
                    </div>
                    <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-[11px] font-black uppercase tracking-wider shadow-none">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Register Debt
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-red-500/5 rounded-xl p-2 border border-red-500/10">
                    <div className="flex items-center space-x-2 w-full lg:w-auto">
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
                    </div>
                    <div className="flex items-center space-x-4 w-full lg:w-auto px-6 border-l border-red-500/10">
                        <div className="text-right">
                            <span className="fin-label text-[9px] text-red-500/60">Total Global Obligations</span>
                            <div className="text-xl fin-data text-red-500">
                                INR {liabilities.reduce((sum, l) => sum + (l.outstandingAmount?.amount || 0), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* List/Grid Transition */}
                {viewMode === 'GRID' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {liabilities.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                <Plus className="h-8 w-8 text-red-500 mx-auto mb-3 opacity-20" />
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">Zero Debt Baseline</h3>
                            </div>
                        ) : (
                            liabilities.map((item) => (
                                <Card key={item.id} className="glass-card group p-3 border-none flex flex-col justify-between h-36 border-l-2 border-l-red-500/40">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <span className="fin-label text-[8px] truncate block opacity-50 mb-0.5">{item.type}</span>
                                            <h3 className="text-xs font-black text-white truncate">{item.name}</h3>
                                        </div>
                                        <Badge variant="outline" className="text-[7px] font-black uppercase tracking-tighter h-3.5 px-1 border-white/10">
                                            {item.type === 'LOAN' ? (item as any).details?.lender : (item as any).details?.bankIssuer}
                                        </Badge>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-lg fin-data text-red-500">
                                            {item.outstandingAmount?.currency} {item.outstandingAmount?.amount?.toLocaleString()}
                                        </div>
                                        <div className="flex items-center mt-2 gap-1">
                                            <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-tighter bg-white/5 py-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                                <Pencil className="h-2.5 w-2.5" /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="px-2 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-red-500/50 hover:text-red-500 transition-all">
                                                <Trash2 className="h-2.5 w-2.5" /> Delete
                                            </button>
                                        </div>
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
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Liability Identity</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Sector</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Lender Node</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Exposure</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right text-right">Cmd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {liabilities.map((item) => (
                                    <tr key={item.id} className="zebra-row hover:bg-white/10 group h-10">
                                        <td className="px-4 py-0">
                                            <div className="text-[11px] font-bold text-white/90">{item.name}</div>
                                        </td>
                                        <td className="px-4 py-0">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-red-500/20 text-red-500 h-4 px-1">
                                                {item.type}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-0">
                                            <div className="text-[10px] font-medium text-white/40 uppercase">
                                                {item.type === 'LOAN' ? (item as any).details?.lender : (item as any).details?.bankIssuer}
                                            </div>
                                        </td>
                                        <td className="px-4 py-0 text-right font-black tabular-nums text-red-500 text-[11px]">
                                            {item.outstandingAmount?.currency} {item.outstandingAmount?.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-0 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(item)} className="p-1 hover:text-primary transition-colors text-[9px] font-black uppercase opacity-40 hover:opacity-100" title="Edit"><Pencil className="h-3 w-3" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-500 transition-colors text-[9px] font-black uppercase opacity-40 hover:opacity-100" title="Delete"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingLiability ? 'Edit Liability' : 'Add New Liability'}
                >
                    {isModalOpen && (
                        <LiabilityForm
                            initialData={editingLiability || undefined}
                            onSuccess={handleSave}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    )}
                </Modal>
            </div>
        </Layout>
    );
}
