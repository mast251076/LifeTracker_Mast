"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AssetForm } from '@/components/assets/AssetForm';
import { Asset, AssetType, IncomeSource } from '@/types';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { Plus, Filter, LayoutGrid, List } from 'lucide-react';

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [filterType, setFilterType] = useState<AssetType | 'ALL'>('ALL');
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [mounted, setMounted] = useState(false);

    const loadData = () => {
        const data = storage.getAppData();
        if (data) {
            setAssets(data.assets);
        }
    };

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    if (!mounted) return null;

    const handleSaveAsset = (assetData: Omit<Asset, 'id' | 'lastUpdated'>) => {
        if (editingAsset) {
            // Update existing
            const updatedAsset = {
                ...assetData,
                id: editingAsset.id,
                lastUpdated: new Date().toISOString(),
            } as Asset;
            storage.updateAsset(updatedAsset);
        } else {
            // Create new
            const newAsset = {
                ...assetData,
                id: `asset_${Date.now()}`,
                lastUpdated: new Date().toISOString(),
            } as Asset;
            const currentData = storage.getAppData();
            storage.saveAppData({ ...currentData, assets: [...currentData.assets, newAsset] });
        }

        loadData();
        setIsAddOpen(false);
        setEditingAsset(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this asset?')) {
            storage.deleteAsset(id);
            loadData();
        }
    };

    const openEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsAddOpen(true);
    };

    const openAdd = () => {
        setEditingAsset(null);
        setIsAddOpen(true);
    };

    const filteredAssets = filterType === 'ALL'
        ? assets
        : assets.filter(a => a.type === filterType);

    const totalValue = filteredAssets.reduce((sum, a) => sum + a.currentValue.amount, 0);

    return (
        <Layout>
            <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Wealth Assets</h2>
                        <p className="text-muted-foreground mt-1">Track and grow your net worth through diversified assets.</p>
                    </div>
                    <Button onClick={openAdd} className="h-11 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-5 w-5" /> Add New Asset
                    </Button>
                </div>

                {/* Filters and Summary */}
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
                        <div className="flex-1 min-w-[200px]">
                            <select
                                className="w-full bg-muted/40 text-sm border-white/5 rounded-xl h-11 px-4 focus:ring-primary focus:border-primary transition-all cursor-pointer outline-none appearance-none"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            >
                                <option value="ALL">All Categories</option>
                                <option value="REAL_ESTATE">🏠 Real Estate</option>
                                <option value="VEHICLE">🚗 Vehicles</option>
                                <option value="INVESTMENT">📊 Investments</option>
                                <option value="BANK_ACCOUNT">🏦 Bank Accounts</option>
                                <option value="JEWELLERY">💎 Jewellery & Gold</option>
                                <option value="ELECTRONICS">💻 Electronics</option>
                                <option value="OTHER">📁 Others</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none mb-1">Total Valuation</p>
                            <p className="text-3xl font-extrabold text-green-500 tabular-nums">{formatCurrency(totalValue)}</p>
                        </div>
                    </div>
                </div>

                {/* Asset Display */}
                {viewMode === 'GRID' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAssets.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass-card border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 rounded-full bg-muted/30">
                                    <Plus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">No assets found</h3>
                                <p className="text-muted-foreground max-w-sm">Capture your wealth by adding your first asset property, vehicle, or investment.</p>
                                <Button variant="outline" onClick={openAdd} className="mt-4">Register Asset</Button>
                            </div>
                        ) : (
                            filteredAssets.map((asset) => (
                                <Card key={asset.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col pt-2">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-background/50 backdrop-blur" onClick={() => openEdit(asset)}>
                                            <Filter className="h-3 w-3" /> {/* Replace icon or keep simple */}
                                        </Button>
                                    </div>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold truncate max-w-[200px]">{asset.name}</CardTitle>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/20 rounded-lg">
                                                {asset.type === 'OTHER' ? asset.customCategory : asset.type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between pt-4">
                                        <div>
                                            <div className="text-3xl font-black tabular-nums">{formatCurrency(asset.currentValue.amount, asset.currentValue.currency)}</div>
                                            {asset.description && (
                                                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{asset.description}</p>
                                            )}
                                        </div>
                                        <div className="mt-6 flex items-center justify-between gap-2">
                                            <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs font-bold" onClick={() => openEdit(asset)}>Manage</Button>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => handleDelete(asset.id)}>Flush</Button>
                                        </div>
                                    </CardContent>
                                    <div className="h-1 w-full bg-gradient-to-r from-primary/50 to-transparent absolute bottom-0" />
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="glass-card border-none rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-white/5">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Name</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Value</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold">{asset.name}</td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted border border-white/5">
                                                {asset.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-black tabular-nums">
                                            {formatCurrency(asset.currentValue.amount, asset.currentValue.currency)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(asset)}>Update</Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(asset.id)}>Delete</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
            >
                {isAddOpen && (
                    <AssetForm
                        initialData={editingAsset || undefined}
                        onCancel={() => setIsAddOpen(false)}
                        onSubmit={handleSaveAsset}
                    />
                )}
            </Modal>
        </Layout>
    );
}
