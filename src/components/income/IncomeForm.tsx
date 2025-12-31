"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { IncomeSource, IncomeType, IncomeFrequency } from '@/types';
import { storage } from '@/lib/storage';

interface IncomeFormProps {
    initialData?: IncomeSource;
    onSuccess: () => void;
    onCancel: () => void;
}

export function IncomeForm({ initialData, onSuccess, onCancel }: IncomeFormProps) {
    const [formData, setFormData] = useState<Partial<IncomeSource>>(initialData || {
        name: '',
        type: 'SALARY',
        amount: { amount: 0, currency: 'INR' },
        frequency: 'MONTHLY',
        isTaxable: true,
        receiveDate: 1,
        notes: '',
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newIncome: IncomeSource = {
                id: initialData?.id || crypto.randomUUID(),
                name: formData.name!,
                type: formData.type as IncomeType,
                amount: {
                    amount: Number(formData.amount?.amount),
                    currency: 'INR'
                },
                frequency: formData.frequency as IncomeFrequency,
                isTaxable: formData.isTaxable!,
                receiveDate: Number(formData.receiveDate),
                linkedAccountId: formData.linkedAccountId,
                notes: formData.notes
            };

            if (initialData) {
                storage.updateIncomeSource(newIncome);
            } else {
                const data = storage.getAppData();
                if (data) {
                    const updatedIncome = [...(data.incomeSources || []), newIncome];
                    storage.saveAppData({ ...data, incomeSources: updatedIncome });
                }
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save income', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Income Type</Label>
                    <Select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeType })}
                        disabled={!!initialData}
                    >
                        <option value="SALARY">Salary</option>
                        <option value="FREELANCE">Freelance</option>
                        <option value="RENTAL">Rental</option>
                        <option value="DIVIDEND">Dividend</option>
                        <option value="INTEREST">Interest</option>
                        <option value="OTHER">Other</option>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Source Name</Label>
                    <Input
                        id="name"
                        required
                        placeholder="e.g. Google Salary"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Net Amount (INR)</Label>
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
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as IncomeFrequency })}
                    >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="ANNUAL">Annual</option>
                        <option value="ONE_TIME">One Time</option>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Receive Date (Day of Month)</Label>
                    <Input
                        id="date"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.receiveDate}
                        onChange={(e) => setFormData({ ...formData, receiveDate: Number(e.target.value) })}
                    />
                </div>

                <div className="space-y-2 flex items-center pt-8">
                    <input
                        type="checkbox"
                        id="taxable"
                        className="mr-2 h-4 w-4"
                        checked={formData.isTaxable}
                        onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                    />
                    <Label htmlFor="taxable" className="mb-0">Tax Deducted at Source?</Label>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    placeholder="Additional details..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (initialData ? 'Update Income' : 'Add Income Source')}
                </Button>
            </div>
        </form >
    );
}
