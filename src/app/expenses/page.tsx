"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Expense } from '@/types';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('LIST'); // Expenses defaults to LIST
    const [mounted, setMounted] = useState(false);

    const loadData = () => {
        const data = storage.getAppData();
        if (data && data.expenses) {
            setExpenses(data.expenses);
        }
    };

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            storage.deleteExpense(id);
            loadData();
        }
    };

    const openEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    if (!mounted) return null;

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Expense Log</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <List className="h-3 w-3 mr-1.5" /> Transactional Entropy Monitor
                        </p>
                    </div>
                    <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-[11px] font-black uppercase tracking-wider shadow-none">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Log Expense
                    </Button>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
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

                {viewMode === 'LIST' ? (
                    <div className="bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/10 border-b border-white/5">
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Timestamp</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Entity / Category</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Sector</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Debit Amount</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cmd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-white/20 text-xs font-black uppercase tracking-[0.3em]">No Logged Entropy</td>
                                    </tr>
                                ) : (
                                    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                                        <tr key={exp.id} className="zebra-row hover:bg-white/10 group h-10">
                                            <td className="px-4 py-0">
                                                <div className="text-[10px] font-black text-white/40">{new Date(exp.date).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-4 py-0">
                                                <div className="text-[11px] font-bold text-white/90">{exp.merchant || exp.category}</div>
                                                <div className="text-[9px] text-white/30 uppercase font-black">{exp.subCategory}</div>
                                            </td>
                                            <td className="px-4 py-0">
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-white/10 h-4 px-1 leading-none">
                                                    {exp.category}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-0 text-right font-black tabular-nums text-orange-500 text-[11px]">
                                                - {exp.amount.currency} {exp.amount.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-0 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => openEdit(exp)} className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors">Audit</button>
                                                    <button onClick={() => handleDelete(exp.id)} className="text-[9px] font-black uppercase text-red-500/40 hover:text-red-500 transition-colors">Flush</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                        {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                            <Card key={exp.id} className="glass-card group p-2 border-none flex flex-col justify-between h-28 border-l-2 border-l-orange-500/40">
                                <div>
                                    <div className="text-[8px] font-black text-white/30 uppercase mb-0.5">{new Date(exp.date).toLocaleDateString()}</div>
                                    <h3 className="text-[10px] font-black text-white truncate">{exp.merchant || exp.category}</h3>
                                </div>
                                <div className="mt-auto">
                                    <div className="text-xs fin-data text-orange-500">
                                        -{exp.amount.amount.toLocaleString()}
                                    </div>
                                    <div className="flex items-center mt-1.5 pt-1.5 border-t border-white/5 justify-between">
                                        <button onClick={() => openEdit(exp)} className="text-[8px] font-black uppercase text-white/40 hover:text-white">Audit</button>
                                        <button onClick={() => handleDelete(exp.id)} className="text-[8px] font-black uppercase text-red-500/40 hover:text-red-500">Del</button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
                >
                    {isModalOpen && (
                        <ExpenseForm
                            initialData={editingExpense || undefined}
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
