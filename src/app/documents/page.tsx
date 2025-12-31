"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { storage } from '@/lib/storage';
import { Badge } from '@/components/ui/Badge';
import { AppDocument, DocumentCategory } from '@/types';
import { FileText, Plus, Search, Calendar, Landmark, Shield, Car, Home, MoreVertical, Trash2, Edit2, LayoutGrid, List } from 'lucide-react';

const CATEGORY_ICONS: Record<DocumentCategory, any> = {
    IDENTITY: Shield,
    VEHICLE: Car,
    PROPERTY: Home,
    INSURANCE: Landmark,
    HEALTH: Shield,
    FINANCE: Landmark,
    OTHER: FileText,
};

const getCategoryIcon = (category: DocumentCategory) => {
    const Icon = CATEGORY_ICONS[category] || FileText;
    return <Icon className="h-5 w-5" />;
};

const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<AppDocument[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<AppDocument | null>(null);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [mounted, setMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<AppDocument>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = storage.getAppData();
        setDocuments(data.documents || []);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newDoc: AppDocument = {
            id: editingDoc?.id || crypto.randomUUID(),
            title: formData.title || 'Untitled Document',
            category: formData.category as DocumentCategory || 'OTHER',
            documentNumber: formData.documentNumber,
            expiryDate: formData.expiryDate,
            issuer: formData.issuer,
            notes: formData.notes,
            lastUpdated: new Date().toISOString(),
        };

        storage.updateDocument(newDoc);
        loadData();
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            storage.deleteDocument(id);
            loadData();
        }
    };

    const openAdd = () => {
        setEditingDoc(null);
        setFormData({ category: 'OTHER' });
        setIsModalOpen(true);
    };

    const openEdit = (doc: AppDocument) => {
        setEditingDoc(doc);
        setFormData(doc);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDoc(null);
        setFormData({});
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Document Matrix</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <FileText className="h-3 w-3 mr-1.5" /> Encrypted Paperwork Repository
                        </p>
                    </div>
                    <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-black uppercase tracking-wider shadow-none">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Ingest Document
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
                        <Input
                            placeholder="Search Matrix..."
                            className="pl-9 h-8 bg-black/20 border-white/5 text-[11px] rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                        className="h-8 bg-black/20 border-white/5 text-[11px] rounded-lg"
                    >
                        <option value="ALL">All Sectors</option>
                        <option value="IDENTITY">Identity</option>
                        <option value="VEHICLE">Vehicle</option>
                        <option value="PROPERTY">Property</option>
                        <option value="INSURANCE">Insurance</option>
                        <option value="HEALTH">Health</option>
                        <option value="FINANCE">Finance</option>
                        <option value="OTHER">Other</option>
                    </Select>
                    <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-lg border border-white/5 w-fit">
                        <Button
                            variant={viewMode === 'GRID' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md"
                            onClick={() => setViewMode('GRID')}
                        >
                            <LayoutGrid className="h-3 w-3" />
                        </Button>
                        <Button
                            variant={viewMode === 'LIST' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md"
                            onClick={() => setViewMode('LIST')}
                        >
                            <List className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {filteredDocs.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-xl">
                        <FileText className="mx-auto h-8 w-8 text-white/20 mb-3" />
                        <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">No Records Found</h3>
                        <Button variant="outline" onClick={openAdd} className="mt-4 h-8 text-[10px] uppercase font-black border-white/10">
                            Ingest First Document
                        </Button>
                    </div>
                ) : (
                    viewMode === 'GRID' ? (
                        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {filteredDocs.map((doc) => {
                                const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();

                                return (
                                    <Card key={doc.id} className="glass-card group p-3 border-none flex flex-col justify-between h-40 border-l-2 border-l-blue-500/40">
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0">
                                                <span className="fin-label text-[8px] truncate block opacity-50 mb-0.5">{doc.category.replace('_', ' ')}</span>
                                                <h3 className="text-xs font-black text-white truncate group-hover:text-blue-400 transition-colors">{doc.title}</h3>
                                            </div>
                                            <div className="p-1.5 rounded bg-blue-500/10 text-blue-500 shrink-0">
                                                {getCategoryIcon(doc.category)}
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-2">
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-white/30 uppercase font-black">Ref</span>
                                                <span className="font-mono font-bold text-white/60">{doc.documentNumber || 'UNSET'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-white/30 uppercase font-black">EXP</span>
                                                <span className={`font-bold ${isExpiringSoon(doc.expiryDate) ? 'text-orange-500' : isExpired ? 'text-red-500' : 'text-white/60'}`}>
                                                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center mt-2 pt-2 border-t border-white/5 gap-1">
                                                <button onClick={() => openEdit(doc)} className="flex-1 text-[9px] font-black uppercase bg-white/5 py-1 rounded hover:bg-white/10 text-white/50">Details</button>
                                                <button onClick={() => handleDelete(doc.id)} className="px-2 text-[9px] font-black uppercase text-red-500/50 hover:text-red-500">Purge</button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/5 rounded-lg overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/10 border-b border-white/5">
                                        <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Document Node</th>
                                        <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Sector</th>
                                        <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground font-mono">Reference</th>
                                        <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cadence/Expiry</th>
                                        <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cmd</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredDocs.map((doc) => {
                                        const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                                        return (
                                            <tr key={doc.id} className="zebra-row hover:bg-white/10 group h-10">
                                                <td className="px-4 py-0">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="p-1 rounded bg-blue-500/10 text-blue-500">
                                                            {getCategoryIcon(doc.category)}
                                                        </div>
                                                        <div className="text-[11px] font-bold text-white/90">{doc.title}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-0">
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-blue-500/20 text-blue-500 h-3.5 px-1 leading-none">
                                                        {doc.category.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-0 font-mono text-[10px] text-white/40">{doc.documentNumber || '—'}</td>
                                                <td className={`px-4 py-0 text-right text-[10px] font-bold ${isExpiringSoon(doc.expiryDate) ? 'text-orange-500' : isExpired ? 'text-red-500' : 'text-white/40'}`}>
                                                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-0 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <button onClick={() => openEdit(doc)} className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors">Audit</button>
                                                        <button onClick={() => handleDelete(doc.id)} className="text-[9px] font-black uppercase text-red-500/40 hover:text-red-500 transition-colors">Purge</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingDoc ? 'Edit Document' : 'Add Document'}>
                <form onSubmit={handleSave} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            >
                                <option value="IDENTITY">Identity</option>
                                <option value="VEHICLE">Vehicle</option>
                                <option value="PROPERTY">Property</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="HEALTH">Health</option>
                                <option value="FINANCE">Finance</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Document Title</Label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Passport"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Document Number</Label>
                            <Input
                                value={formData.documentNumber}
                                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                                placeholder="e.g. A1234567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Issuer</Label>
                            <Input
                                value={formData.issuer}
                                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                placeholder="e.g. Govt of India"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Input
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">{editingDoc ? 'Update Document' : 'Save Document'}</Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
