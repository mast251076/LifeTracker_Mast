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
import { Plus, TrendingUp, Calendar, ArrowRight, LayoutGrid, List } from 'lucide-react';

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
            <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Income Streams</h2>
                        <p className="text-muted-foreground mt-1">Maximize your cash inflows and track earnings across all channels.</p>
                    </div>
                    <Button onClick={openAdd} className="h-11 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-5 w-5" /> Add Income Source
                    </Button>
                </div>

                {/* Summary & View Toggle Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="flex items-center space-x-2 bg-muted/40 p-1.5 rounded-xl border border-white/5 h-fit">
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

                    <div className="grid gap-6 md:grid-cols-1 w-full md:w-auto">
                        <Card className="glass-card group relative overflow-hidden border-none pt-2 min-w-[300px]">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-50" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Monthly In-Hand</CardTitle>
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-black text-emerald-500 tabular-nums">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalMonthlyIncome)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Transition Section */}
                {viewMode === 'GRID' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {incomes.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass-card border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 rounded-full bg-emerald-500/10">
                                    <Plus className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h3 className="text-lg font-bold">No income streams registered</h3>
                                <p className="text-muted-foreground max-w-sm">Capture your monthly salary, dividends, or rental income to see your true purchasing power.</p>
                            </div>
                        ) : (
                            incomes.map((item) => (
                                <Card key={item.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold truncate max-w-[180px]">{item.name}</CardTitle>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/20 rounded-lg">
                                                {item.frequency.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                            Type: {item.type.toLowerCase().replace('_', ' ')}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between pt-4">
                                        <div>
                                            <div className="text-3xl font-black tabular-nums">{item.amount.currency} {item.amount.amount.toLocaleString()}</div>
                                            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-white/5">
                                                <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    <Calendar className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                                    Next Payday
                                                </div>
                                                <span className="text-xs font-black">{item.receiveDate ? item.receiveDate + 'th of month' : 'Rolling'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between gap-2">
                                            <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs font-bold" onClick={() => openEdit(item)}>Edit Details</Button>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>Remove</Button>
                                        </div>
                                    </CardContent>
                                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500/50 to-transparent absolute bottom-0" />
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="glass-card border-none rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-white/5">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Source Name</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {incomes.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold">{item.name}</td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted border border-white/5 uppercase tracking-widest opacity-70">
                                                {item.type.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border-emerald-500/20 rounded-lg">
                                                {item.frequency.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right font-black tabular-nums text-emerald-500">
                                            {item.amount.currency} {item.amount.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>Remove</Button>
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
