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
import { Plus, Filter, LayoutGrid, List, PieChart, Pencil, Trash2 } from 'lucide-react';

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
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Wealth Assets</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <PieChart className="h-3 w-3 mr-1.5" /> Capital Deployment Index
                        </p>
                    </div>
                    <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-wider shadow-none">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Initialize Asset
                    </Button>
                </div>

                {/* Filters and Summary (High Density) */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white/5 rounded-xl p-2 border border-white/5">
                    <div className="flex items-center space-x-2 w-full lg:w-auto">
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
                        <div className="h-9 min-w-[160px]">
                            <select
                                className="w-full h-full bg-black/20 text-[11px] font-bold uppercase tracking-wider border-white/5 rounded-lg px-3 focus:ring-primary outline-none appearance-none cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            >
                                <option value="ALL">All Sectors</option>
                                <option value="REAL_ESTATE">🏠 Real Estate</option>
                                <option value="VEHICLE">🚗 Vehicles</option>
                                <option value="INVESTMENT">📊 Investments</option>
                                <option value="BANK_ACCOUNT">🏦 Bank Accounts</option>
                                <option value="JEWELLERY">💎 Jewellery</option>
                                <option value="ELECTRONICS">💻 Tech Stack</option>
                                <option value="OTHER">📁 MISC</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 w-full lg:w-auto px-4 lg:px-6 border-l border-white/5">
                        <div className="text-right">
                            <span className="fin-label text-[9px]">Composite Valuation</span>
                            <div className="text-xl fin-data text-green-500">{formatCurrency(totalValue)}</div>
                        </div>
                    </div>
                </div>

                {/* Asset Display */}
                {viewMode === 'GRID' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredAssets.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">No Sector Data</h3>
                            </div>
                        ) : (
                            filteredAssets.map((asset) => (
                                <Card key={asset.id} className="glass-card group p-3 border-none flex flex-col justify-between h-40 hover:translate-y-[-2px]">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <span className="fin-label text-[8px] truncate block opacity-50 mb-0.5">
                                                {asset.type === 'OTHER' ? asset.customCategory : asset.type.replace('_', ' ')}
                                            </span>
                                            <h3 className="text-xs font-black text-white truncate group-hover:text-primary transition-colors">{asset.name}</h3>
                                        </div>
                                        <div className="flex shrink-0 ml-2">
                                            <button onClick={() => openEdit(asset)} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground" title="Edit Asset">
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="text-lg fin-data text-white">
                                            {formatCurrency(asset.currentValue.amount, asset.currentValue.currency)}
                                        </div>
                                        <div className="flex items-center mt-2 pt-2 border-t border-white/5 gap-1.5">
                                            <button onClick={() => openEdit(asset)} className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-tighter bg-white/5 py-1 rounded hover:bg-white/10 transition-all text-white/50 hover:text-white">
                                                <Pencil className="h-2.5 w-2.5" /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(asset.id)} className="px-2 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-red-500/50 hover:text-red-500 transition-all">
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
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Asset Identity</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Sector</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Liquidation Value</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cmd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="zebra-row hover:bg-white/10 group h-10">
                                        <td className="px-4 py-0">
                                            <div className="text-[11px] font-bold text-white/90">{asset.name}</div>
                                        </td>
                                        <td className="px-4 py-0">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-white/10 h-4 px-1 leading-none">
                                                {asset.type.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-0 text-right">
                                            <div className="text-[11px] fin-data text-white">
                                                {formatCurrency(asset.currentValue.amount, asset.currentValue.currency)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-0 text-right">
                                            <div className="flex justify-end space-x-1">
                                                <button onClick={() => openEdit(asset)} className="p-1 hover:text-primary transition-colors" title="Edit"><Pencil className="h-3 w-3" /></button>
                                                <button onClick={() => handleDelete(asset.id)} className="p-1 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="h-3 w-3" /></button>
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
