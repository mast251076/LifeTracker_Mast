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
import { Save, RefreshCcw, Download, Trash2, CheckCircle2 } from 'lucide-react';
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
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
                    <p className="text-muted-foreground">Customize your experience and manage your data.</p>
                </div>

                <div className="grid gap-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">User Profile</CardTitle>
                            <CardDescription>Update your personal information used across the app.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Preferences</CardTitle>
                            <CardDescription>Setup your default currency and visual theme.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Default Currency</Label>
                                <Select
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                >
                                    <option value="INR">Indian Rupee (INR)</option>
                                    <option value="USD">US Dollar (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                    <option value="GBP">British Pound (GBP)</option>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="theme">App Theme</Label>
                                <Select
                                    id="theme"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as any)}
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System Default</option>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Data Management</CardTitle>
                            <CardDescription>Export your data for backup or clear everything to start fresh.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <button
                                onClick={() => exportDataToExcel("Complete_Data_Export")}
                                className="glass-card inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 h-11 px-6 py-2"
                            >
                                <Download className="mr-2 h-4 w-4 text-primary" />
                                Export All Data
                            </button>
                            <Button variant="destructive" onClick={handleReset} className="flex items-center">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset Application Data
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        {saveStatus === 'success' && (
                            <div className="flex items-center text-sm text-green-500 animate-in fade-in slide-in-from-right-2">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Settings saved successfully
                            </div>
                        )}
                        <Button onClick={handleSave} disabled={isSaving} className="w-32">
                            {isSaving ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
