"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { storage } from '@/lib/storage';
import { AppData } from '@/types';
import { Settings, Database, Code, RefreshCcw, Save, Trash2, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

export default function ConfigPage() {
    const [rawJson, setRawJson] = useState('');
    const [isValidJson, setIsValidJson] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [stats, setStats] = useState({
        assetCount: 0,
        liabilitiesCount: 0,
        docsCount: 0,
        storageSize: '0 KB'
    });

    useEffect(() => {
        const data = storage.getAppData();
        if (data) {
            setRawJson(JSON.stringify(data, null, 2));
            updateStats(data);
        }
    }, []);

    const updateStats = (data: AppData) => {
        const size = new Blob([JSON.stringify(data)]).size;
        setStats({
            assetCount: data.assets?.length || 0,
            liabilitiesCount: data.liabilities?.length || 0,
            docsCount: data.documents?.length || 0,
            storageSize: (size / 1024).toFixed(2) + ' KB'
        });
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setRawJson(value);
        try {
            JSON.parse(value);
            setIsValidJson(true);
        } catch (err) {
            setIsValidJson(false);
        }
    };

    const handleSave = () => {
        try {
            const parsed = JSON.parse(rawJson);
            storage.saveAppData(parsed);
            updateStats(parsed);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(rawJson);
    };

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">System Parameters</h2>
                        <p className="text-muted-foreground mt-1 text-lg">Modify core application data and configuration parameters.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground opacity-60">Storage Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stats.storageSize}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Browser LocalStorage</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground opacity-60">Assets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stats.assetCount}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Total Records</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground opacity-60">Liabilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stats.liabilitiesCount}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Debt Records</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground opacity-60">Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stats.docsCount}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Secure Files</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="glass-card border-none overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Code className="h-5 w-5 text-purple-400" />
                                        <div>
                                            <CardTitle>Master Data JSON</CardTitle>
                                            <CardDescription>Directly edit the underlying data structure.</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!isValidJson && (
                                            <Badge variant="destructive" className="animate-pulse">Invalid JSON</Badge>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 rounded-lg">
                                            <Copy className="h-3 w-3 mr-2" />
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Textarea
                                    value={rawJson}
                                    onChange={handleJsonChange}
                                    className="min-h-[600px] font-mono text-xs bg-black/40 border-none rounded-none focus-visible:ring-0 p-6 leading-relaxed custom-scrollbar"
                                    placeholder="Paste your JSON here..."
                                />
                            </CardContent>
                            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {saveStatus === 'success' && (
                                        <span className="text-xs text-green-500 flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Changes Applied
                                        </span>
                                    )}
                                </div>
                                <Button
                                    onClick={handleSave}
                                    disabled={!isValidJson}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 shadow-lg shadow-purple-500/20"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Push Update
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="glass-card border-none">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Database className="h-5 w-5 mr-2 text-purple-400" />
                                    Data Operations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground">Advanced operations for system administration.</p>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold group"
                                    >
                                        <span className="flex items-center">
                                            <RefreshCcw className="h-4 w-4 mr-3 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
                                            Force Refresh UI
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (confirm('This will wipe all data. Proceed?')) {
                                                storage.resetData();
                                                window.location.reload();
                                            }
                                        }}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-all text-sm font-semibold text-red-500 group"
                                    >
                                        <span className="flex items-center">
                                            <Trash2 className="h-4 w-4 mr-3" />
                                            Factory Reset
                                        </span>
                                        <AlertTriangle className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-none bg-gradient-to-br from-purple-500/10 to-transparent">
                            <CardHeader>
                                <CardTitle className="text-lg">Developer Note</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    This console allows you to inject raw parameters that are not yet available via the standard UI.
                                    <br /><br />
                                    Be careful: Modifying the <strong>id</strong> fields manually can break relationships between records.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
