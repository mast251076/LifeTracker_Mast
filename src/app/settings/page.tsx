"use client";

import { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { storage } from '@/lib/storage';
import { AppData, Currency } from '@/types';
import { Save, RefreshCcw, Download, Trash2, CheckCircle2, Settings } from 'lucide-react';
import { exportDataToExcel } from '@/lib/export';

export default function SettingsPage() {
    const [data, setData] = useState<AppData | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState<Currency>('INR');
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const appData = storage.getAppData();
        setData(appData);
        if (appData.profile) {
            setName(appData.profile.name);
            setEmail(appData.profile.email || '');
            setCurrency(appData.profile.currencyPreference);
            setTheme(appData.profile.themePreference);
        }
    }, []);

    const handleSave = () => {
        if (!data) return;
        setIsSaving(true);
        setSaveStatus('idle');

        const updatedProfile = {
            ...data.profile,
            name,
            email: email || undefined,
            currencyPreference: currency,
            themePreference: theme,
        };

        storage.updateProfile(updatedProfile);

        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }, 800);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            storage.resetData();
            window.location.reload();
        }
    };

    if (!data) return null;

    return (
        <Layout>
            <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white">System Configuration</h2>
                        <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
                            <Settings className="h-3 w-3 mr-1.5" /> Core Environment Variables
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile Section */}
                    <Card className="glass-card p-4 border-none border-l-2 border-l-blue-500/40">
                        <div className="mb-4">
                            <h3 className="fin-label text-[10px]">Operator Profile</h3>
                            <p className="text-[10px] text-white/40 uppercase font-black">Identity and contact vector settings</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="text-[10px] uppercase font-black text-white/40">Identity Handle</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-8 bg-black/20 border-white/5 text-[11px] rounded-lg"
                                    placeholder="Operator Name"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-[10px] uppercase font-black text-white/40">Communication Node</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-8 bg-black/20 border-white/5 text-[11px] rounded-lg"
                                    placeholder="operator@system.node"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Preferences Section */}
                    <Card className="glass-card p-4 border-none border-l-2 border-l-emerald-500/40">
                        <div className="mb-4">
                            <h3 className="fin-label text-[10px]">Regional Protocol</h3>
                            <p className="text-[10px] text-white/40 uppercase font-black">Localization and UI theme parameters</p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="currency" className="text-[10px] uppercase font-black text-white/40">Base Currency Unit</Label>
                                <Select
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="h-8 bg-black/20 border-white/5 text-[11px] rounded-lg"
                                >
                                    <option value="INR">Indian Rupee (INR)</option>
                                    <option value="USD">US Dollar (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                    <option value="GBP">British Pound (GBP)</option>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="theme" className="text-[10px] uppercase font-black text-white/40">Visual Interface Mode</Label>
                                <Select
                                    id="theme"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as any)}
                                    className="h-8 bg-black/20 border-white/5 text-[11px] rounded-lg"
                                >
                                    <option value="light">Luminous</option>
                                    <option value="dark">Stealth (Dark)</option>
                                    <option value="system">Auto-Sync System</option>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Data Management Section */}
                    <Card className="glass-card p-4 border-none border-l-2 border-l-red-500/40 md:col-span-2">
                        <div className="mb-4">
                            <h3 className="fin-label text-[10px]">Data Integrity & I/O</h3>
                            <p className="text-[10px] text-white/40 uppercase font-black">Archive export and destructive memory flush</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => exportDataToExcel("Complete_Data_Export")}
                                className="h-8 px-4 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/5"
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                Extract All Data (.xlsx)
                            </Button>
                            <Button variant="ghost" onClick={handleReset} className="h-8 px-4 text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-wider">
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Initiate Factory Reset
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-end space-x-4 border-t border-white/5 pt-4">
                    {saveStatus === 'success' && (
                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                            Parameters Sync Complete
                        </div>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="h-8 px-6 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-none">
                        {isSaving ? (
                            <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <>
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                Sync Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
