"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Expense, ExpenseCategory, ExpenseSubCategory } from '@/types';
import { storage } from '@/lib/storage';

interface ExpenseFormProps {
    initialData?: Expense;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ExpenseForm({ initialData, onSuccess, onCancel }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Expense>>(initialData || {
        amount: { amount: 0, currency: 'INR' },
        date: new Date().toISOString().split('T')[0],
        category: 'VARIABLE',
        subCategory: 'FOOD',
        merchant: '',
        paymentInstrumentId: 'cash', // Default placeholder
        isRecurring: false,
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newExpense: Expense = {
                id: initialData?.id || crypto.randomUUID(),
                amount: {
                    amount: Number(formData.amount?.amount),
                    currency: 'INR'
                },
                date: formData.date!,
                category: formData.category as ExpenseCategory,
                subCategory: formData.subCategory as ExpenseSubCategory,
                merchant: formData.merchant,
                paymentInstrumentId: formData.paymentInstrumentId!,
                description: formData.description,
                isRecurring: formData.isRecurring || false,
                tags: []
            };

            const data = storage.getAppData();
            if (data) {
                if (initialData) {
                    storage.updateExpense(newExpense);
                } else {
                    const updatedExpenses = [...(data.expenses || []), newExpense];
                    storage.saveAppData({ ...data, expenses: updatedExpenses });
                }
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to save expense', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input
                        id="amount"
                        type="number"
                        required
                        min="0"
                        value={formData.amount?.amount}
                        onChange={(e) => setFormData({ ...formData, amount: { amount: Number(e.target.value), currency: 'INR' } })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    >
                        <option value="FIXED">Fixed (Rent, EMI)</option>
                        <option value="VARIABLE">Variable (Food, Travel)</option>
                        <option value="DISCRETIONARY">Discretionary (Shopping)</option>
                        <option value="SAVINGS">Savings</option>
                        <option value="INVESTMENT">Investment</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subCategory">Sub-Category</Label>
                    <Select
                        id="subCategory"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value as ExpenseSubCategory })}
                    >
                        <option value="RENT">Rent</option>
                        <option value="EMI">EMI</option>
                        <option value="FOOD">Food</option>
                        <option value="TRAVEL">Travel</option>
                        <option value="SHOPPING">Shopping</option>
                        <option value="UTILITIES">Utilities</option>
                        <option value="HEALTH">Health</option>
                        <option value="ENTERTAINMENT">Entertainment</option>
                        <option value="OTHER">Other</option>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="merchant">Merchant / Payee</Label>
                <Input
                    id="merchant"
                    placeholder="e.g. Swiggy, Uber, Landlord"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Notes (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Dinner with team..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <input
                    type="checkbox"
                    id="recurring"
                    className="h-4 w-4"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
                <Label htmlFor="recurring" className="mb-0">This is a recurring expense</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
                </Button>
            </div>
        </form>
    );
}
