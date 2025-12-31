"use client";

import { useState, useEffect } from "react";
import { Asset, AssetType, Currency, OwnershipType, AssetStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface AssetFormProps {
    initialData?: Asset;
    onSubmit: (data: Omit<Asset, "id" | "lastUpdated">) => void;
    onCancel: () => void;
}

const ASSET_TYPES: { value: AssetType; label: string }[] = [
    { value: "REAL_ESTATE", label: "Real Estate" },
    { value: "VEHICLE", label: "Vehicle" },
    { value: "BANK_ACCOUNT", label: "Bank Account" },
    { value: "INVESTMENT", label: "Investment" },
    { value: "JEWELLERY", label: "Jewellery" },
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "OTHER", label: "Other" },
];

const CURRENCIES: Currency[] = ["INR", "USD", "EUR", "GBP"];
const OWNERSHIPS: OwnershipType[] = ["SELF", "SPOUSE", "JOINT", "DEPENDENT", "BUSINESS", "HUF"];

export function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
    // Default state matches the 'REAL_ESTATE' type initially to satisfy the union
    const [formData, setFormData] = useState<Asset>(
        initialData || ({
            id: "",
            lastUpdated: "",
            name: "",
            type: "REAL_ESTATE",
            ownership: "SELF",
            status: "ACTIVE",
            currentValue: { amount: 0, currency: "INR" },
            purchaseValue: { amount: 0, currency: "INR" },
            details: {
                propertyType: "FLAT",
                area: { value: 0, unit: "SQ_FT" }
            }
        } as Asset)
    );

    const handleBaseChange = (field: keyof Asset, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value } as Asset));
    };

    const handleMoneyChange = (field: "currentValue" | "purchaseValue", amount: string) => {
        const num = parseFloat(amount) || 0;
        setFormData((prev) => ({
            ...prev,
            [field]: { ...prev[field]!, amount: num },
        } as Asset));
    };

    const handleDetailsChange = (field: string, value: any) => {
        setFormData((prev) => {
            // Safe cast because we know details exists on all variants
            const currentDetails = (prev as any).details || {};
            return {
                ...prev,
                details: { ...currentDetails, [field]: value }
            } as Asset;
        });
    };

    // Specific handler to switch types and reset details to valid defaults
    const handleTypeChange = (newType: AssetType) => {
        let defaultDetails = {};

        switch (newType) {
            case 'REAL_ESTATE':
                defaultDetails = { propertyType: 'FLAT', area: { value: 0, unit: 'SQ_FT' } }; break;
            case 'VEHICLE':
                defaultDetails = { subType: 'CAR', make: '', model: '' }; break;
            case 'BANK_ACCOUNT':
                defaultDetails = { bankName: '', accountType: 'SAVINGS' }; break;
            case 'INVESTMENT':
                defaultDetails = { investmentType: 'MUTUAL_FUND' }; break;
            case 'JEWELLERY':
                defaultDetails = { material: 'GOLD', weight: { value: 0, unit: 'GRAMS' } }; break;
            case 'ELECTRONICS':
                defaultDetails = { category: 'LAPTOP', brand: '' }; break;
            case 'OTHER':
                defaultDetails = {}; break;
        }

        setFormData(prev => ({
            ...prev,
            type: newType,
            customCategory: newType === 'OTHER' ? '' : undefined, // Reset custom category
            details: defaultDetails
        } as Asset));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData); // ID and lastUpdated will be handled by parent
    };

    const renderDetailsFields = () => {
        switch (formData.type) {
            case 'REAL_ESTATE':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Property Type</Label>
                                <Select
                                    value={(formData as any).details.propertyType}
                                    onChange={(e) => handleDetailsChange('propertyType', e.target.value)}
                                >
                                    {['FLAT', 'VILLA', 'PLOT', 'COMMERCIAL', 'AGRICULTURAL'].map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={(formData as any).details.city || ''}
                                    onChange={(e) => handleDetailsChange('city', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Possession Date</Label>
                                <Input
                                    type="date"
                                    value={(formData as any).details.possessionDate || ''}
                                    onChange={(e) => handleDetailsChange('possessionDate', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Area (Sq Ft)</Label>
                                <Input
                                    type="number"
                                    value={(formData as any).details.area?.value || 0}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        handleDetailsChange('area', { ...(formData as any).details.area, value: val });
                                    }}
                                />
                            </div>
                        </div>
                    </>
                );
            case 'VEHICLE':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={(formData as any).details.subType}
                                onChange={(e) => handleDetailsChange('subType', e.target.value)}
                            >
                                {['CAR', 'BIKE', 'SCOOTER', 'EV'].map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Number</Label>
                            <Input
                                value={(formData as any).details.registrationNumber || ''}
                                onChange={(e) => handleDetailsChange('registrationNumber', e.target.value)}
                                placeholder="KA-01-AB-1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Make</Label>
                            <Input
                                value={(formData as any).details.make || ''}
                                onChange={(e) => handleDetailsChange('make', e.target.value)}
                                placeholder="Honda, Tata"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <Input
                                value={(formData as any).details.model || ''}
                                onChange={(e) => handleDetailsChange('model', e.target.value)}
                                placeholder="City, Nexon"
                            />
                        </div>
                    </div>
                );
            case 'BANK_ACCOUNT':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                                value={(formData as any).details.bankName || ''}
                                onChange={(e) => handleDetailsChange('bankName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Type</Label>
                            <Select
                                value={(formData as any).details.accountType}
                                onChange={(e) => handleDetailsChange('accountType', e.target.value)}
                            >
                                {['SAVINGS', 'CURRENT', 'FD', 'RD'].map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number (Last 4)</Label>
                            <Input
                                value={(formData as any).details.accountNumber || ''}
                                onChange={(e) => handleDetailsChange('accountNumber', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'INVESTMENT':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={(formData as any).details.investmentType}
                                onChange={(e) => handleDetailsChange('investmentType', e.target.value)}
                            >
                                {['MUTUAL_FUND', 'STOCK', 'BOND', 'ETF'].map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Symbol/Ticker</Label>
                            <Input
                                value={(formData as any).details.symbol || ''}
                                onChange={(e) => handleDetailsChange('symbol', e.target.value)}
                                placeholder="TCS, RELIANCE"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Platform</Label>
                            <Input
                                value={(formData as any).details.platform || ''}
                                onChange={(e) => handleDetailsChange('platform', e.target.value)}
                                placeholder="Zerodha, Groww"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Asset Category</Label>
                    <Select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value as AssetType)}
                    >
                        {ASSET_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Name / Title</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleBaseChange("name", e.target.value)}
                        placeholder="e.g. Primary Residence, Savings"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ownership">Ownership</Label>
                    <Select
                        id="ownership"
                        value={formData.ownership}
                        onChange={(e) => handleBaseChange("ownership", e.target.value as OwnershipType)}
                    >
                        {OWNERSHIPS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onChange={(e) => handleBaseChange("status", e.target.value as AssetStatus)}
                    >
                        {['ACTIVE', 'SOLD', 'CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
            </div>

            {formData.type === "OTHER" && (
                <div className="space-y-2">
                    <Label htmlFor="customCategory">Custom Category Name</Label>
                    <Input
                        id="customCategory"
                        value={(formData as any).customCategory || ""}
                        onChange={(e) => handleBaseChange("customCategory", e.target.value)}
                        placeholder="e.g. Art Collection"
                    />
                </div>
            )}

            <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                <h4 className="font-semibold text-sm">Category Specific Details</h4>
                {renderDetailsFields()}
                {(formData.type === 'JEWELLERY' || formData.type === 'ELECTRONICS' || formData.type === 'OTHER') && <p className="text-xs text-muted-foreground">Standard details available for this category.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="currentValue">Current Value</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="currentValue"
                            type="number"
                            value={formData.currentValue?.amount || ""}
                            onChange={(e) => handleMoneyChange("currentValue", e.target.value)}
                            placeholder="0.00"
                            required
                        />
                        <div className="bg-muted flex items-center px-3 rounded text-sm text-muted-foreground w-24 justify-center border">
                            {formData.currentValue.currency}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="purchaseValue">Purchase Value (Optional)</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="purchaseValue"
                            type="number"
                            value={formData.purchaseValue?.amount || ""}
                            onChange={(e) => handleMoneyChange("purchaseValue", e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Notes / Description</Label>
                <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleBaseChange("description", e.target.value)}
                    placeholder="Add details..."
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">Save Asset</Button>
            </div>
        </form>
    );
}
