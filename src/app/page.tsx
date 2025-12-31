"use client";

import { useEffect, useState } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AppData } from '@/types';
import { storage } from '@/lib/storage';
import { mockAppData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, FileText, Wallet, Building, CreditCard, Lock, Shield, LayoutGrid, List } from 'lucide-react';
import { exportDataToExcel } from '@/lib/export';

const DashboardIcon = ({ icon: Icon, className }: { icon: any, className?: string }) => {
  return <Icon className={className} />;
};

export default function Dashboard() {
  const [data, setData] = useState<AppData | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('LIST');

  useEffect(() => {
    // Initialize data if empty (Simulator logic)
    const existing = storage.getAppData();
    if (!existing || !existing.profile.isSetupComplete) {
      storage.saveAppData(mockAppData);
      setData(mockAppData);
    } else {
      setData(existing);
    }
  }, []);

  if (!data) return null;

  const totalAssets = data.assets.reduce((sum, item) => sum + item.currentValue.amount, 0);
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.outstandingAmount.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Calculate Deadlines
  const getDeadlines = () => {
    const alerts: { title: string; date: string; type: 'CRITICAL' | 'WARNING'; daysLeft: number }[] = [];
    const today = new Date();

    // 1. Check Credit Card Dues
    data.liabilities.forEach(liab => {
      if (liab.type === 'CREDIT_CARD' && (liab as any).details?.dueDay) {
        const dueDay = (liab as any).details.dueDay;
        const nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
        if (nextDueDate < today) {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }
        const diffTime = Math.abs(nextDueDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          alerts.push({
            title: `${liab.name} Bill Due`,
            date: nextDueDate.toLocaleDateString(),
            type: 'CRITICAL',
            daysLeft: diffDays
          });
        }
      }
    });

    // 2. Check Asset Expiries (Insurance, Warranty)
    data.assets.forEach(asset => {
      if (asset.type === 'VEHICLE') {
        const details = (asset as any).details;
        if (details?.insuranceExpiry) {
          const expiry = new Date(details.insuranceExpiry);
          const diffTime = expiry.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 0 && diffDays <= 30) {
            alerts.push({
              title: `${asset.name} Insurance Expiry`,
              date: expiry.toLocaleDateString(),
              type: diffDays < 7 ? 'CRITICAL' : 'WARNING',
              daysLeft: diffDays
            });
          }
        }
      }
    });

    return alerts;
  };

  const alerts = getDeadlines();

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Overview</h2>
            <p className="text-muted-foreground mt-1 text-lg">Good evening, {data.profile.name}. Here's your financial snapshot.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-muted/40 p-1.5 rounded-xl border border-white/5 mr-2">
              <Button
                variant={viewMode === 'GRID' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
                onClick={() => setViewMode('GRID')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'LIST' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 w-9 p-0 rounded-lg"
                onClick={() => setViewMode('LIST')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <button
              onClick={() => exportDataToExcel("Financial_Snapshot")}
              className="glass-card inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 h-11 px-6 py-2"
            >
              <FileText className="mr-2 h-4 w-4 text-primary" />
              Export Reports
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="grid gap-4">
            <Card className="border-none shadow-2xl bg-gradient-to-br from-yellow-500/10 via-background to-background border-l-4 border-l-yellow-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center text-yellow-500">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 backdrop-blur-sm border border-white/5 rounded-xl transition-all hover:bg-muted/50">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">Deadline: {alert.date}</p>
                      </div>
                      <Badge variant={alert.type === 'CRITICAL' ? 'destructive' : 'secondary'} className="rounded-full px-3">
                        {alert.daysLeft}d left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Metrics Grid */}
        {viewMode === 'GRID' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Net Worth</CardTitle>
                <Wallet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{formatCurrency(netWorth)}</div>
                <div className="mt-2 flex items-center text-xs font-medium text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 12.4% vs LMT
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Assets</CardTitle>
                <Building className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-green-400">{formatCurrency(totalAssets)}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Distribution in {data.assets.length} categories
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Liabilities</CardTitle>
                <CreditCard className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-red-400">{formatCurrency(totalLiabilities)}</div>
                <div className="mt-2 text-xs text-muted-foreground font-medium">
                  DSR: {Math.round((totalLiabilities / (totalAssets || 1)) * 100)}% of Assets
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Documents</CardTitle>
                <FileText className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{data.documents.length}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {data.documents.filter(d => !d.expiryDate).length} perpetual entries
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="glass-card p-2 rounded-2xl border-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
              {[
                { label: 'Net Worth', value: formatCurrency(netWorth), icon: Wallet, color: 'text-primary' },
                { label: 'Assets', value: formatCurrency(totalAssets), icon: Building, color: 'text-green-500' },
                { label: 'Liabilities', value: formatCurrency(totalLiabilities), icon: CreditCard, color: 'text-red-500' },
                { label: 'Vault', value: data.vaultEntries.length, icon: Lock, color: 'text-purple-500' }
              ].map((m, i) => (
                <div key={i} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60 mb-1">{m.label}</p>
                    <p className="text-xl font-black tabular-nums">{m.value}</p>
                  </div>
                  <m.icon className={`h-8 w-8 ${m.color} opacity-20`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 glass-card border-none">
            <CardHeader>
              <div>
                <CardTitle className="text-xl font-bold">Financial Health</CardTitle>
                <CardDescription>
                  Summary of your recent wealth movements.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'LIST' ? (
                <div className="space-y-4">
                  {data.assets.length > 0 ? data.assets.slice(0, 6).map((asset) => (
                    <div key={asset.id} className="flex items-center group/item p-3 glass-card border-white/5 rounded-xl transition-all hover:bg-primary/5">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="ml-4 flex-1 space-y-0.5">
                        <p className="text-sm font-bold leading-none">{asset.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">
                          {asset.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm tabular-nums">
                          {formatCurrency(asset.currentValue?.amount || 0)}
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase py-0 px-1 border-white/5 opacity-60">{asset.status}</Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">No assets recorded yet.</div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {data.assets.length > 0 ? data.assets.slice(0, 4).map((asset) => (
                    <div key={asset.id} className="p-4 glass-card border-none rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Building className="h-12 w-12" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 opacity-60">{asset.type.replace('_', ' ')}</p>
                        <h4 className="font-bold text-lg mb-2">{asset.name}</h4>
                        <div className="text-xl font-black text-primary">{formatCurrency(asset.currentValue?.amount || 0)}</div>
                      </div>
                      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-transparent" />
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">No assets recorded yet.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 glass-card border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              <CardDescription>
                Direct entry and portal shortcuts.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { label: 'Register Asset', icon: Building, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Log Expense', icon: ArrowDownRight, color: 'text-red-500', bg: 'bg-red-500/10' },
                { label: 'Safe Upload', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Vault Access', icon: Lock, color: 'text-purple-500', bg: 'bg-purple-500/10' }
              ].map((action, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all hover:translate-x-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.bg} ${action.color}`}>
                      <DashboardIcon icon={action.icon} className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{action.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
