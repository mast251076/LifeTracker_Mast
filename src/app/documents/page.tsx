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
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
                        <p className="text-muted-foreground">Securely track your important papers and IDs.</p>
                    </div>
                    <Button onClick={openAdd} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Document
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or number..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                        className="w-full md:w-48"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="IDENTITY">Identity</option>
                        <option value="VEHICLE">Vehicle</option>
                        <option value="PROPERTY">Property</option>
                        <option value="INSURANCE">Insurance</option>
                        <option value="HEALTH">Health</option>
                        <option value="FINANCE">Finance</option>
                        <option value="OTHER">Other</option>
                    </Select>
                </div>

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
                    </div>
                </div>

                {filteredDocs.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                        <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
                        <p className="text-muted-foreground">Start by adding your first important document.</p>
                        <Button variant="outline" onClick={openAdd} className="mt-4">
                            Add Document
                        </Button>
                    </div>
                ) : (
                    viewMode === 'GRID' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredDocs.map((doc) => {
                                const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();

                                return (
                                    <Card key={doc.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                                    {getCategoryIcon(doc.category)}
                                                </div>
                                                {isExpiringSoon(doc.expiryDate) && (
                                                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] font-bold">Expiring Soon</Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg font-bold truncate">{doc.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                                {doc.category.replace('_', ' ')} {doc.issuer && `• ${doc.issuer}`}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-between pt-4">
                                            <div className="space-y-3">
                                                {doc.documentNumber && (
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">ID Number</span>
                                                        <span className="font-mono font-bold">{doc.documentNumber}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Expiry Date</span>
                                                    <span className={`font-bold ${isExpiringSoon(doc.expiryDate) ? 'text-orange-500' : ''} ${isExpired ? 'text-destructive' : ''}`}>
                                                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'No Expiry'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between gap-2">
                                                <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs font-bold" onClick={() => openEdit(doc)}>Manage</Button>
                                                <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => handleDelete(doc.id)}>Archive</Button>
                                            </div>
                                        </CardContent>
                                        <div className="h-1 w-full bg-gradient-to-r from-blue-500/50 to-transparent absolute bottom-0" />
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-card border-none rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 border-b border-white/5">
                                    <tr>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Document</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID Number</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiry</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredDocs.map((doc) => {
                                        const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                                        return (
                                            <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                                            {getCategoryIcon(doc.category)}
                                                        </div>
                                                        <span className="font-bold">{doc.title}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="rounded-lg bg-blue-500/5 text-blue-500 border-blue-500/20 uppercase tracking-widest text-[10px]">
                                                        {doc.category.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 font-mono text-sm opacity-80">{doc.documentNumber || 'N/A'}</td>
                                                <td className={`p-4 text-sm font-bold ${isExpiringSoon(doc.expiryDate) ? 'text-orange-500' : ''} ${isExpired ? 'text-destructive' : ''}`}>
                                                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button variant="ghost" size="sm" onClick={() => openEdit(doc)}>Manage</Button>
                                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(doc.id)}>Archive</Button>
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
