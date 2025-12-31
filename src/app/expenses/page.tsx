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
            <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Expense Log</h2>
                        <p className="text-muted-foreground mt-1">Monitor your spending habits and keep your budget on track.</p>
                    </div>
                    <Button onClick={openAdd} className="h-11 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-700">
                        <Plus className="mr-2 h-5 w-5" /> Log New Expense
                    </Button>
                </div>

                <div className="flex items-center justify-between glass-card p-4 rounded-2xl border-none">
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

                {viewMode === 'LIST' ? (
                    <div className="grid gap-4">
                        {expenses.length === 0 ? (
                            <div className="py-20 text-center glass-card border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 rounded-full bg-amber-500/10">
                                    <Plus className="h-8 w-8 text-amber-500" />
                                </div>
                                <h3 className="text-lg font-bold">No expenses logged</h3>
                                <p className="text-muted-foreground max-w-sm">Every penny counts. Start logging your daily expenses to gain financial clarity.</p>
                            </div>
                        ) : (
                            expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                                <div key={exp.id} className="glass-card group flex items-center justify-between p-5 rounded-2xl border-none transition-all duration-300 hover:bg-white/5 active:scale-[0.99] relative overflow-hidden">
                                    <div className="absolute left-0 top-0 w-1 h-full bg-amber-500/30" />
                                    <div className="flex items-center space-x-5">
                                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black leading-none opacity-50 mb-0.5">{new Date(exp.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                            <span className="text-lg font-black leading-none">{new Date(exp.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-lg tracking-tight group-hover:text-amber-400 transition-colors">{exp.merchant || exp.category}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-muted/50 border-white/5 rounded-lg py-0 px-2 h-5">
                                                    {exp.category}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-medium opacity-60">• {exp.subCategory}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-8">
                                        <div className="text-right">
                                            <div className="text-xl font-black text-amber-500 tabular-nums">- {exp.amount.currency} {exp.amount.amount.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Source: {exp.paymentInstrumentId === 'cash' ? 'Cash' : 'Primary Account'}</div>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10" onClick={() => openEdit(exp)}>
                                                <span className="text-[10px] font-bold font-mono">EDIT</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(exp.id)}>
                                                <span className="text-[10px] font-bold font-mono">DEL</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                            <Card key={exp.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col pt-2">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold truncate max-w-[150px]">{exp.merchant || exp.category}</CardTitle>
                                        <div className="text-xs font-black text-amber-500 tabular-nums">-{exp.amount.amount.toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/5 text-amber-500 border-amber-500/20 rounded-lg">
                                            {exp.category}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between pt-4">
                                    <p className="text-xs text-muted-foreground line-clamp-2 italic">Managed via {exp.paymentInstrumentId === 'cash' ? 'Cash' : 'Bank'}</p>
                                    <div className="mt-6 flex items-center justify-between gap-2">
                                        <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs font-bold" onClick={() => openEdit(exp)}>View</Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => handleDelete(exp.id)}>Flush</Button>
                                    </div>
                                </CardContent>
                                <div className="h-1 w-full bg-gradient-to-r from-amber-500/50 to-transparent absolute bottom-0" />
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
