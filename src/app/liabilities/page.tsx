"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LiabilityForm } from '@/components/liabilities/LiabilityForm';
import { storage } from '@/lib/storage';
import { Plus, LayoutGrid, List } from 'lucide-react';
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
            <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Debt & Liabilities</h2>
                        <p className="text-muted-foreground mt-1">Monitor and clear your financial obligations efficiently.</p>
                    </div>
                    <Button onClick={openAdd} className="h-11 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700">
                        <Plus className="mr-2 h-5 w-5" /> Register Debt
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-6 rounded-2xl border-none">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="flex items-center space-x-2 bg-muted/40 p-1.5 rounded-xl border border-white/5">
                            <Button
                                variant={viewMode === 'GRID' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg"
                                onClick={() => setViewMode('GRID')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'LIST' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg"
                                onClick={() => setViewMode('LIST')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Total Obligations</p>
                        <p className="text-3xl font-black text-red-500 tabular-nums">
                            INR {liabilities.reduce((sum, l) => sum + (l.outstandingAmount?.amount || 0), 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* List/Grid Transition */}
                {viewMode === 'GRID' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {liabilities.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass-card border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 rounded-full bg-red-500/10">
                                    <Plus className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold">No debt records</h3>
                                <p className="text-muted-foreground max-w-sm">Keep your financial profile clean by recording loans and credit cards.</p>
                            </div>
                        ) : (
                            liabilities.map((item) => (
                                <Card key={item.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-lg">{item.type}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                            {item.type === 'LOAN' ? (item as any).details?.lender : (item as any).details?.bankIssuer}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between pt-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Outstanding Balance</p>
                                            <p className="text-3xl font-black text-red-500 tabular-nums">
                                                {item.outstandingAmount?.currency} {item.outstandingAmount?.amount?.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between gap-2">
                                            <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs font-bold" onClick={() => openEdit(item)}>Update</Button>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>Settle</Button>
                                        </div>
                                    </CardContent>
                                    <div className="h-1 w-full bg-gradient-to-r from-red-500/50 to-transparent absolute bottom-0" />
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="glass-card border-none rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-white/5">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Liability Name</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Lender/Bank</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Outstanding</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {liabilities.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold">{item.name}</td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-lg">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {item.type === 'LOAN' ? (item as any).details?.lender : (item as any).details?.bankIssuer}
                                        </td>
                                        <td className="p-4 text-right font-black tabular-nums text-red-500">
                                            {item.outstandingAmount?.currency} {item.outstandingAmount?.amount?.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>Update</Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>Settle</Button>
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
