"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Liability, LiabilityType, LoanLiability, CreditCardLiability, Currency } from '@/types';
import { storage } from '@/lib/storage';

interface LiabilityFormProps {
    initialData?: Liability;
    onSuccess: (liability: Liability) => void;
    onCancel: () => void;
}

export function LiabilityForm({ initialData, onSuccess, onCancel }: LiabilityFormProps) {
    const isLoan = initialData?.type === 'LOAN';
    const isCC = initialData?.type === 'CREDIT_CARD';
    const details = (initialData as any)?.details || {};

    const [type, setType] = useState<LiabilityType>(initialData?.type || 'LOAN');
    const [name, setName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState(initialData?.outstandingAmount?.amount?.toString() || '');
    const [currency, setCurrency] = useState<Currency>(initialData?.outstandingAmount?.currency || 'INR');
    const [notes, setNotes] = useState(initialData?.notes || '');

    // Loan specific
    const [loanType, setLoanType] = useState(isLoan ? details.loanType : 'HOME');
    const [lender, setLender] = useState(isLoan ? details.lender : '');
    const [interestRate, setInterestRate] = useState(isLoan ? details.interestRate?.toString() : '');
    const [tenure, setTenure] = useState(isLoan ? details.tenureMonths?.toString() : '');
    const [emi, setEmi] = useState(isLoan ? details.emiAmount?.amount?.toString() : '');

    // Credit Card specific
    const [issuer, setIssuer] = useState(isCC ? details.issuer : '');
    const [network, setNetwork] = useState(isCC ? details.network : 'VISA');
    const [limit, setLimit] = useState(isCC ? details.creditLimit?.amount?.toString() : '');
    const [billingDay, setBillingDay] = useState(isCC ? details.billingDay?.toString() : '');
    const [dueDay, setDueDay] = useState(isCC ? details.dueDay?.toString() : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const base = {
            id: initialData?.id || `liability_${Date.now()}`,
            name,
            status: 'ACTIVE' as const,
            outstandingAmount: {
                amount: parseFloat(amount) || 0,
                currency
            },
            lastUpdated: new Date().toISOString(),
            notes,
        };

        // ... (rest same as before but need to make sure we return the object)

        let newLiability: Liability;

        if (type === 'LOAN') {
            newLiability = {
                ...base,
                type: 'LOAN',
                details: {
                    loanType: loanType as any,
                    lender,
                    principalAmount: { amount: parseFloat(amount) || 0, currency },
                    interestRate: parseFloat(interestRate) || 0,
                    isFloatingInterest: false,
                    tenureMonths: parseInt(tenure) || 0,
                    emiAmount: { amount: parseFloat(emi) || 0, currency }
                }
            } as LoanLiability;
        } else if (type === 'CREDIT_CARD') {
            newLiability = {
                ...base,
                type: 'CREDIT_CARD',
                details: {
                    network: network as any,
                    issuer,
                    creditLimit: { amount: parseFloat(limit) || 0, currency },
                    billingDay: parseInt(billingDay) || 1,
                    dueDay: parseInt(dueDay) || 1,
                }
            } as CreditCardLiability;
        } else {
            newLiability = {
                ...base,
                type: 'BORROWING',
                details: {}
            } as any;
        }

        // We don't save here anymore, we pass data back to parent
        onSuccess(newLiability);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onChange={(e) => setType(e.target.value as LiabilityType)} disabled={!!initialData}>
                        <option value="LOAN">Loan</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="BORROWING">Generic Borrowing</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                        placeholder={type === 'LOAN' ? "e.g. Home Loan" : "e.g. Amazon Pay ICICI"}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{type === 'LOAN' ? 'Outstanding Principal' : 'Current Outstanding'}</Label>
                    <div className="flex space-x-2">
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                        <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-24">
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Dynamic Fields Section */}
            <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                {type === 'LOAN' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Lender(Bank)</Label>
                                <Input value={lender} onChange={e => setLender(e.target.value)} placeholder="e.g. SBI" />
                            </div>
                            <div className="space-y-2">
                                <Label>Loan Type</Label>
                                <Select value={loanType} onChange={e => setLoanType(e.target.value)}>
                                    <option value="HOME">Home Loan</option>
                                    <option value="CAR">Car Loan</option>
                                    <option value="PERSONAL">Personal Loan</option>
                                    <option value="EDUCATION">Education Loan</option>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Interest (%)</Label>
                                <Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tenure (Months)</Label>
                                <Input type="number" value={tenure} onChange={e => setTenure(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>EMI Amount</Label>
                                <Input type="number" value={emi} onChange={e => setEmi(e.target.value)} />
                            </div>
                        </div>
                    </>
                )}

                {type === 'CREDIT_CARD' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Issuer Bank</Label>
                                <Input value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="e.g. HDFC" />
                            </div>
                            <div className="space-y-2">
                                <Label>Network</Label>
                                <Select value={network} onChange={e => setNetwork(e.target.value)}>
                                    <option value="VISA">Visa</option>
                                    <option value="MASTERCARD">Mastercard</option>
                                    <option value="AMEX">Amex</option>
                                    <option value="RUPAY">Rupay</option>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Total Limit</Label>
                                <Input type="number" value={limit} onChange={e => setLimit(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Billing Day</Label>
                                <Input type="number" min="1" max="31" placeholder="DD" value={billingDay} onChange={e => setBillingDay(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Day</Label>
                                <Input type="number" min="1" max="31" placeholder="DD" value={dueDay} onChange={e => setDueDay(e.target.value)} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                    placeholder="Additional details..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{initialData ? 'Update Liability' : 'Save Liability'}</Button>
            </div>
        </form>
    );
}
