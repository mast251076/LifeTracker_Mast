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
import { generateId } from '@/lib/uuid';
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
    const [mounted, setMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<VaultEntry>>({});

    useEffect(() => {
        setMounted(true);
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
            id: editingEntry?.id || generateId('vault'),
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

    if (!mounted) return null;

    if (!isUnlocked) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in zoom-in duration-500">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <Lock className="h-8 w-8 text-primary opacity-60" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-black tracking-tighter text-white uppercase">Vault Terminal</h2>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Access Protocol Required</p>
                    </div>
                    <form onSubmit={handleUnlock} className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                        <Input
                            type="password"
                            placeholder="PIN"
                            className="bg-black/40 border-white/5 text-center text-xl tracking-[0.5em] h-10 rounded-lg selection:bg-primary/20"
                            maxLength={4}
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                        />
                        <Button type="submit" className="w-full h-8 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Authorize Access</Button>
                        <p className="text-[10px] text-white/20 font-medium italic">Demo PIN: 1234</p>
                    </form>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Secure Vault</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <Lock className="h-3 w-3 mr-1.5" /> Zero-Knowledge Credential Storage
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsUnlocked(false)} className="h-8 text-[10px] font-black uppercase text-white/40 hover:text-white">
                            Lock Terminal
                        </Button>
                        <Button onClick={openAdd} className="h-8 px-4 rounded-lg bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-wider shadow-none">
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Store Secret
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
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
                </div>

                {viewMode === 'GRID' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {entries.length === 0 ? (
                            <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                <Shield className="mx-auto h-8 w-8 text-white/20 mb-3" />
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">Vault Empty</h3>
                                <Button variant="outline" onClick={openAdd} className="mt-4 h-8 text-[10px] font-black uppercase border-white/10">Add Entry</Button>
                            </div>
                        ) : (
                            entries.map((entry) => (
                                <Card key={entry.id} className="glass-card group p-3 border-none flex flex-col justify-between h-44 border-l-2 border-l-primary/40">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0">
                                            <span className="fin-label text-[8px] truncate block opacity-50 mb-0.5">{entry.category.replace('_', ' ')}</span>
                                            <h3 className="text-xs font-black text-white truncate">{entry.title}</h3>
                                        </div>
                                        <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0">
                                            <Key className="h-3 w-3" />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        {entry.username && (
                                            <div className="flex items-center justify-between bg-black/40 p-1.5 rounded border border-white/5 group/copy">
                                                <span className="text-[10px] font-medium text-white/60 truncate mr-2">{entry.username}</span>
                                                <button onClick={() => copyToClipboard(entry.username!, entry.id + 'u')} className="opacity-0 group-hover/copy:opacity-100 transition-opacity">
                                                    {copiedId === entry.id + 'u' ? <CheckCircle2 className="h-2.5 w-2.5 text-green-500" /> : <Copy className="h-2.5 w-2.5 text-white/30" />}
                                                </button>
                                            </div>
                                        )}
                                        {entry.password && (
                                            <div className="flex items-center justify-between bg-black/40 p-1.5 rounded border border-white/5 group/copy">
                                                <span className="text-[10px] font-mono text-white/60">
                                                    {showPasswords[entry.id] ? entry.password : '••••••••'}
                                                </span>
                                                <div className="flex items-center space-x-1.5 opacity-0 group-hover/copy:opacity-100 transition-opacity">
                                                    <button onClick={() => togglePassword(entry.id)}>
                                                        {showPasswords[entry.id] ? <EyeOff className="h-2.5 w-2.5 text-white/30" /> : <Eye className="h-2.5 w-2.5 text-white/30" />}
                                                    </button>
                                                    <button onClick={() => copyToClipboard(entry.password!, entry.id + 'p')}>
                                                        {copiedId === entry.id + 'p' ? <CheckCircle2 className="h-2.5 w-2.5 text-green-500" /> : <Copy className="h-2.5 w-2.5 text-white/30" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center pt-2 border-t border-white/5 gap-1">
                                        <button onClick={() => openEdit(entry)} className="flex-1 text-[9px] font-black uppercase bg-white/5 py-1 rounded hover:bg-white/10 text-white/50">Audit</button>
                                        <button onClick={() => handleDelete(entry.id)} className="px-2 text-[9px] font-black uppercase text-red-500/50 hover:text-red-500">Flush</button>
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
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Entity Node</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground font-mono">Principal Identifier</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cadence/Update</th>
                                    <th className="px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right">Cmd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="zebra-row hover:bg-white/10 group h-10">
                                        <td className="px-4 py-0">
                                            <div className="flex items-center space-x-2">
                                                <div className="p-1 rounded bg-primary/10 text-primary">
                                                    <Key className="h-3 w-3" />
                                                </div>
                                                <div className="text-[11px] font-bold text-white/90">{entry.title}</div>
                                                <span className="text-[8px] font-black uppercase text-white/20">{entry.category.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-0 font-mono text-[10px] text-white/40">{entry.username || 'SECRET-PRIN'}</td>
                                        <td className="px-4 py-0 text-right text-[10px] text-white/20">{new Date(entry.lastUpdated || Date.now()).toLocaleDateString()}</td>
                                        <td className="px-4 py-0 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => copyToClipboard(entry.password || '', entry.id + 'p')} className="text-[9px] font-black uppercase text-primary/40 hover:text-primary transition-colors">Copy</button>
                                                <button onClick={() => openEdit(entry)} className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors">Audit</button>
                                                <button onClick={() => handleDelete(entry.id)} className="text-[9px] font-black uppercase text-red-500/40 hover:text-red-500 transition-colors">Purge</button>
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
