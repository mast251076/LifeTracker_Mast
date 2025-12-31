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
import { VaultEntry, VaultCategory } from '@/types';
import { Lock, Plus, Key, Shield, FileText, Eye, EyeOff, Copy, Trash2, Edit2, CheckCircle2, LayoutGrid, List } from 'lucide-react';

export default function VaultPage() {
    const [entries, setEntries] = useState<VaultEntry[]>([]);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [masterPassword, setMasterPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

    // Form State
    const [formData, setFormData] = useState<Partial<VaultEntry>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = storage.getAppData();
        setEntries(data.vaultEntries || []);
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded check for demo, real app would use crypto/session
        if (masterPassword === '1234') {
            setIsUnlocked(true);
        } else {
            alert('Incorrect PIN (Hint: 1234)');
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const entry: VaultEntry = {
            id: editingEntry?.id || crypto.randomUUID(),
            title: formData.title || 'Untitled Entry',
            category: formData.category as VaultCategory || 'OTHER',
            accountName: formData.accountName,
            username: formData.username,
            password: formData.password,
            secretNote: formData.secretNote,
            lastUpdated: new Date().toISOString(),
        };

        storage.updateVaultEntry(entry);
        loadData();
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this vault entry?')) {
            storage.deleteVaultEntry(id);
            loadData();
        }
    };

    const togglePassword = (id: string) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openAdd = () => {
        setEditingEntry(null);
        setFormData({ category: 'PASSWORD' });
        setIsModalOpen(true);
    };

    const openEdit = (entry: VaultEntry) => {
        setEditingEntry(entry);
        setFormData(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
        setFormData({});
    };

    if (!isUnlocked) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="p-6 rounded-full bg-primary/10">
                        <Lock className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Secure Vault</h2>
                        <p className="text-muted-foreground">Enter your Vault PIN to access sensitive data.</p>
                    </div>
                    <form onSubmit={handleUnlock} className="flex flex-col items-center gap-4 w-full max-w-xs">
                        <Input
                            type="password"
                            placeholder="Enter 4-digit PIN"
                            className="text-center text-2xl tracking-[1em]"
                            maxLength={4}
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                        />
                        <Button type="submit" className="w-full">Unlock Vault</Button>
                        <p className="text-xs text-muted-foreground">Note: For this demo, use PIN: <span className="font-mono font-bold">1234</span></p>
                    </form>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Vault</h2>
                        <p className="text-muted-foreground">Manage your sensitive credentials and private notes.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsUnlocked(false)}>Lock</Button>
                        <Button onClick={openAdd} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Entry
                        </Button>
                    </div>
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

                {viewMode === 'GRID' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entries.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass-card border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4">
                                <Shield className="mx-auto h-12 w-12 text-muted-foreground/30" />
                                <h3 className="mt-4 text-lg font-semibold">Vault is empty</h3>
                                <p className="text-muted-foreground">Securely store your first password or secret note.</p>
                                <Button variant="outline" onClick={openAdd} className="mt-4">
                                    Add Entry
                                </Button>
                            </div>
                        ) : (
                            entries.map((entry) => (
                                <Card key={entry.id} className="glass-card group hover:bg-card/80 transition-all duration-300 border-none relative overflow-hidden flex flex-col">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <Key className="h-5 w-5" />
                                            </div>
                                            <CardTitle className="text-base font-semibold">{entry.title}</CardTitle>
                                        </div>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {entry.username && (
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Username</Label>
                                                <div className="flex items-center justify-between bg-muted/40 p-2 rounded text-sm">
                                                    <span>{entry.username}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(entry.username!, entry.id + 'u')}>
                                                        {copiedId === entry.id + 'u' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {entry.password && (
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Password</Label>
                                                <div className="flex items-center justify-between bg-muted/40 p-2 rounded text-sm">
                                                    <span className="font-mono">
                                                        {showPasswords[entry.id] ? entry.password : '••••••••••••'}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePassword(entry.id)}>
                                                            {showPasswords[entry.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(entry.password!, entry.id + 'p')}>
                                                            {copiedId === entry.id + 'p' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Name</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <Key className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold">{entry.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{entry.username || '—'}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(entry.password || '', entry.id + 'p')}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(entry)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(entry.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEntry ? 'Edit Vault Entry' : 'Add Vault Entry'}>
                <form onSubmit={handleSave} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        >
                            <option value="PASSWORD">Password</option>
                            <option value="BANK_PIN">Bank PIN</option>
                            <option value="SECRET_NOTE">Secret Note</option>
                            <option value="RECOVERY_PHRASE">Recovery Phrase</option>
                            <option value="OTHER">Other</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Title / Account Name</Label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Primary Email"
                        />
                    </div>

                    {(formData.category === 'PASSWORD' || formData.category === 'BANK_PIN') && (
                        <>
                            <div className="space-y-2">
                                <Label>Username / ID</Label>
                                <Input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password / PIN</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {(formData.category === 'SECRET_NOTE' || formData.category === 'RECOVERY_PHRASE' || formData.category === 'OTHER') && (
                        <div className="space-y-2">
                            <Label>Secret Content / Notes</Label>
                            <textarea
                                className="w-full min-h-[100px] bg-background border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={formData.secretNote}
                                onChange={(e) => setFormData({ ...formData, secretNote: e.target.value })}
                                placeholder="Enter sensitive information here..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">{editingEntry ? 'Update Entry' : 'Save Entry'}</Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
