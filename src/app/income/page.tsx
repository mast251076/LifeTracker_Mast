"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { IncomeForm } from '@/components/income/IncomeForm';
import { IncomeSource } from '@/types';
import { storage } from '@/lib/storage';
import { Plus, TrendingUp, Calendar, ArrowRight, LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';

export default function IncomePage() {
    const [incomes, setIncomes] = useState<IncomeSource[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [mounted, setMounted] = useState(false);

    const loadData = () => {
        const data = storage.getAppData();
        if (data && data.incomeSources) {
            setIncomes(data.incomeSources);
        }
    };

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this income source?')) {
            storage.deleteIncomeSource(id);
            loadData();
        }
    };

    const openEdit = (income: IncomeSource) => {
        setEditingIncome(income);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingIncome(null);
        setIsModalOpen(true);
    };

    if (!mounted) return null;

    const totalMonthlyIncome = incomes.reduce((sum, inc) => {
        if (inc.frequency === 'MONTHLY') return sum + inc.amount.amount;
        if (inc.frequency === 'QUARTERLY') return sum + (inc.amount.amount / 3);
        if (inc.frequency === 'ANNUAL') return sum + (inc.amount.amount / 12);
        return sum;
    }, 0);

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Income Streams</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1.5" /> Cash Inflow Architecture
                        </p>
                    </div>
                    <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-black uppercase tracking-wider shadow-none">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Register Inflow
                    </Button>
                </div>

                {/* Summary & View Toggle Section (High Density) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 flex items-center space-x-3 bg-white/5 rounded-xl p-2 border border-white/5">
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
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <div className="flex items-center space-x-4">
                            <div>
                                <span className="fin-label text-[9px] block">Monthly Velocity</span>
                                <div className="text-lg fin-data text-emerald-500">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalMonthlyIncome)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transition Section */}
                {viewMode === 'GRID' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {incomes.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                <Plus className="h-8 w-8 text-emerald-500 mx-auto mb-3 opacity-20" />
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">No Active Streams</h3>
                            </div>
                        ) : (
                            incomes.map((item) => (
                                <Card key={item.id} className="glass-card group p-3 border-none flex flex-col justify-between h-36 border-l-2 border-l-emerald-500/40">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <span className="fin-label text-[8px] truncate block opacity-50 mb-0.5">{item.frequency.replace('_', ' ')}</span>
                                            <h3 className="text-xs font-black text-white truncate group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                                        </div>
                                        <div className="flex shrink-0">
                                            <Calendar className="h-3 w-3 text-white/20" />
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-lg fin-data text-white">
                                            {item.amount.currency} {item.amount.amount.toLocaleString()}
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
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Stream Node</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Modality</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Frequency</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Yield</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cmd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {incomes.map((item) => (
                                    <tr key={item.id} className="zebra-row hover:bg-white/10 group h-10">
                                        <td className="px-4 py-0">
                                            <div className="text-[11px] font-bold text-white/90">{item.name}</div>
                                        </td>
                                        <td className="px-4 py-0">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                                {item.type.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-0">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-emerald-500/20 text-emerald-500 h-4 px-1 leading-none">
                                                {item.frequency.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-0 text-right font-black tabular-nums text-emerald-500 text-[11px]">
                                            {item.amount.currency} {item.amount.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-0 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => openEdit(item)} className="p-1 hover:text-primary transition-all text-white/40 hover:text-white" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-500 transition-all text-red-500/40 hover:text-red-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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
                    title={editingIncome ? 'Edit Income Source' : 'Add Income Source'}
                >
                    {isModalOpen && (
                        <IncomeForm
                            initialData={editingIncome || undefined}
                            onSuccess={() => {
                                setIsModalOpen(false);
                                loadData();
                            }}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    )}
                </Modal>
            </div>
        </Layout>
    );
}
