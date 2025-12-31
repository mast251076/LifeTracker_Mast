"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { RetirementAsset, AssetStatus } from '@/types';
import { storage } from '@/lib/storage';

interface RetirementFormProps {
    initialData?: RetirementAsset;
    onSuccess: () => void;
    onCancel: () => void;
}

export function RetirementForm({ initialData, onSuccess, onCancel }: RetirementFormProps) {
    const [loading, setLoading] = useState(false);
    const [schemeType, setSchemeType] = useState<'EPF' | 'PPF' | 'NPS' | 'SSY' | 'GRAVITY' | 'OTHER'>(initialData?.details?.schemeType || 'EPF');
    const [formData, setFormData] = useState<any>({
        name: initialData?.name || 'Employee Provident Fund',
        currentValue: initialData?.currentValue?.amount || 0,
        uan: (initialData as any)?.details?.uan || '',
        pran: (initialData as any)?.details?.pran || '',
        employeeContrib: (initialData as any)?.details?.employeeContribution?.amount || 0,
        employerContrib: (initialData as any)?.details?.employerContribution?.amount || 0,
        tier1: (initialData as any)?.details?.tier1Balance?.amount || 0,
        tier2: (initialData as any)?.details?.tier2Balance?.amount || 0,
    });

    const handleTypeChange = (type: string) => {
        setSchemeType(type as any);
        let defaultName = '';
        switch (type) {
            case 'EPF': defaultName = 'Employee Provident Fund'; break;
            case 'PPF': defaultName = 'Public Provident Fund'; break;
            case 'NPS': defaultName = 'National Pension System'; break;
            case 'SSY': defaultName = 'Sukanya Samriddhi Yojana'; break;
            default: defaultName = 'Retirement Fund';
        }
        setFormData({ ...formData, name: defaultName });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const details: any = {
                schemeType: schemeType,
            };

            if (schemeType === 'EPF') {
                details.uan = formData.uan;
                details.employeeContribution = { amount: Number(formData.employeeContrib), currency: 'INR' };
                details.employerContribution = { amount: Number(formData.employerContrib), currency: 'INR' };
            } else if (schemeType === 'NPS') {
                details.pran = formData.pran;
                details.tier1Balance = { amount: Number(formData.tier1), currency: 'INR' };
                details.tier2Balance = { amount: Number(formData.tier2), currency: 'INR' };
            }

            const updatedAsset: RetirementAsset = {
                id: initialData?.id || crypto.randomUUID(),
                type: 'RETIREMENT',
                name: formData.name,
                ownership: initialData?.ownership || 'SELF',
                status: initialData?.status || 'ACTIVE',
                currentValue: { amount: Number(formData.currentValue), currency: 'INR' },
                lastUpdated: new Date().toISOString(),
                details: details
            };

            const data = storage.getAppData();
            if (data) {
                if (initialData) {
                    storage.updateAsset(updatedAsset);
                } else {
                    const updatedAssets = [...(data.assets || []), updatedAsset];
                    storage.saveAppData({ ...data, assets: updatedAssets });
                }
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to save retirement asset', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="type">Scheme Type</Label>
                <Select
                    id="type"
                    value={schemeType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                >
                    <option value="EPF">EPF (Employee Provident Fund)</option>
                    <option value="PPF">PPF (Public Provident Fund)</option>
                    <option value="NPS">NPS (National Pension System)</option>
                    <option value="SSY">SSY (Sukanya Samriddhi)</option>
                    <option value="GRAVITY">GRAVITY (Fixed Deposit/Other)</option>
                    <option value="OTHER">Other</option>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Fund Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Total Current Value (INR)</Label>
                    <Input
                        id="value"
                        type="number"
                        value={formData.currentValue}
                        onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                        required
                    />
                </div>
            </div>

            {schemeType === 'EPF' && (
                <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                    <div className="space-y-2">
                        <Label htmlFor="uan">UAN (Universal Account Number)</Label>
                        <Input
                            id="uan"
                            placeholder="12 digit UAN"
                            value={formData.uan}
                            onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emp_contrib">Employee Share</Label>
                            <Input
                                id="emp_contrib"
                                type="number"
                                value={formData.employeeContrib}
                                onChange={(e) => setFormData({ ...formData, employeeContrib: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employer_contrib">Employer Share</Label>
                            <Input
                                id="employer_contrib"
                                type="number"
                                value={formData.employerContrib}
                                onChange={(e) => setFormData({ ...formData, employerContrib: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {schemeType === 'NPS' && (
                <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                    <div className="space-y-2">
                        <Label htmlFor="pran">PRAN</Label>
                        <Input
                            id="pran"
                            placeholder="Permanent Retirement Account Number"
                            value={formData.pran}
                            onChange={(e) => setFormData({ ...formData, pran: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tier1">Tier 1 Balance</Label>
                            <Input
                                id="tier1"
                                type="number"
                                value={formData.tier1}
                                onChange={(e) => setFormData({ ...formData, tier1: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tier2">Tier 2 Balance</Label>
                            <Input
                                id="tier2"
                                type="number"
                                value={formData.tier2}
                                onChange={(e) => setFormData({ ...formData, tier2: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (initialData ? 'Update Scheme' : 'Add Retirement Asset')}
                </Button>
            </div>
        </form>
    );
}
