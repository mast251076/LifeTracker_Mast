"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AppData } from '@/types';
import { storage } from '@/lib/storage';
import { mockAppData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, FileText, Wallet, Building, CreditCard, Lock, Shield, LayoutGrid, List, AlertTriangle, Settings } from 'lucide-react';
import { exportDataToExcel } from '@/lib/export';

const DashboardIcon = ({ icon: Icon, className }: { icon: any, className?: string }) => {
  return <Icon className={className} />;
};

export default function Dashboard() {
  const router = useRouter();
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
      <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Command Intelligence</h2>
            <p className="text-muted-foreground mt-0.5 text-[11px] font-medium uppercase tracking-wider opacity-60 flex items-center">
              <Shield className="h-3 w-3 mr-1.5" /> Logical Node: {data.profile.name} (Authorized)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-lg border border-white/5">
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
            <button
              onClick={() => exportDataToExcel("Financial_Snapshot")}
              className="glass-card flex items-center h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border-white/10 hover:bg-white/5"
            >
              <FileText className="mr-1.5 h-3 w-3 text-primary" />
              Terminal Export
            </button>
          </div>
        </div>

        {/* Alerts Section (Compact) */}
        {alerts.length > 0 && (
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-2 flex items-center space-x-4 overflow-x-auto custom-scrollbar no-scrollbar">
            <div className="flex items-center space-x-2 shrink-0 border-r border-orange-500/20 pr-4">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-[9px] font-black uppercase text-orange-500 tracking-tighter">Event Monitor</span>
            </div>
            <div className="flex space-x-4">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] font-bold text-white/70">{alert.title}</span>
                  <Badge variant={alert.type === 'CRITICAL' ? 'destructive' : 'secondary'} className="h-3.5 text-[8px] px-1 font-black leading-none">
                    {alert.daysLeft}D
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Grid (Executive Style) */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Aggregate Equity', value: formatCurrency(netWorth), icon: Wallet, color: 'text-primary', change: '+12.4%', changeType: 'UP', path: '/assets' },
            { label: 'Asset Nodes', value: formatCurrency(totalAssets), icon: Building, color: 'text-emerald-500', sub: `${data.assets.length} Active Positions`, path: '/assets' },
            { label: 'Liability Index', value: formatCurrency(totalLiabilities), icon: CreditCard, color: 'text-red-500', sub: `DSR: ${Math.round((totalLiabilities / (totalAssets || 1)) * 100)}% Velocity`, path: '/liabilities' },
            { label: 'Vault Quant', value: data.vaultEntries.length, icon: Lock, color: 'text-blue-500', sub: `${data.documents.length} Encrypted Records`, path: '/documents' }
          ].map((m, i) => (
            <Card key={i} onClick={() => router.push(m.path)} className="glass-card p-3 border-none flex flex-col justify-between h-24 border-l-2 border-l-white/10 hover:border-l-primary/60 hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <span className="fin-label text-[9px]">{m.label}</span>
                <m.icon className={`h-3 w-3 ${m.color} opacity-40`} />
              </div>
              <div>
                <div className="text-xl fin-data text-white">{m.value}</div>
                <div className="flex items-center mt-1">
                  {m.change ? (
                    <span className="text-[9px] font-black text-emerald-500 flex items-center">
                      <ArrowUpRight className="h-2 w-2 mr-0.5" /> {m.change}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter leading-none">{m.sub}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
          <Card className="lg:col-span-8 glass-card border-none p-0 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Portfolio Architecture</h3>
              <Link href="/assets" className="text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer hover:text-white transition-colors flex items-center group/exp">
                Expand Matrix <ArrowUpRight className="h-2.5 w-2.5 ml-1 group-hover/exp:translate-x-0.5 group-hover/exp:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <CardContent className="p-0 flex-1">
              {viewMode === 'LIST' ? (
                <div className="divide-y divide-white/5">
                  {data.assets.length > 0 ? data.assets.slice(0, 8).map((asset) => (
                    <div key={asset.id} className="flex items-center px-4 h-10 zebra-row group transition-colors">
                      <div className="h-6 w-6 rounded bg-black/40 flex items-center justify-center mr-3 shrink-0 border border-white/5">
                        <Building className="h-3 w-3 text-white/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white/80 truncate">{asset.name}</p>
                      </div>
                      <div className="px-3 text-[9px] font-black uppercase text-white/20 tracking-tighter">
                        {asset.type.replace('_', ' ')}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-[11px] fin-data text-white">
                          {formatCurrency(asset.currentValue?.amount || 0)}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-[10px] font-black uppercase text-white/20">Empty Matrix</div>
                  )}
                </div>
              ) : (
                <div className="grid gap-2 p-3 md:grid-cols-3">
                  {data.assets.length > 0 ? data.assets.slice(0, 9).map((asset) => (
                    <div key={asset.id} className="p-2.5 bg-black/40 rounded border border-white/5 flex flex-col justify-between h-20 hover:bg-black/60 transition-all border-l-2 border-l-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase text-white/20 tracking-tighter">{asset.type.replace('_', ' ')}</span>
                        <Building className="h-2.5 w-2.5 text-white/10" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[10px] text-white/70 truncate leading-tight">{asset.name}</h4>
                        <div className="text-[12px] fin-data text-white mt-1">{formatCurrency(asset.currentValue?.amount || 0)}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center py-10 text-[10px] font-black uppercase text-white/20">Empty Matrix</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 glass-card border-none p-0 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5 bg-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Operation Center</h3>
            </div>
            <CardContent className="p-1 flex-1">
              {[
                { label: 'Register Asset Node', icon: Building, color: 'text-primary', bg: 'bg-primary/5', path: '/assets' },
                { label: 'Log Financial Entropy', icon: ArrowDownRight, color: 'text-orange-500', bg: 'bg-orange-500/5', path: '/expenses' },
                { label: 'Ingest Secure Document', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/5', path: '/documents' },
                { label: 'Sync System Params', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-500/5', path: '/settings' }
              ].map((action, i) => (
                <div key={i} onClick={() => router.push(action.path)} className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer transition-all group active:scale-[0.99]">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1.5 rounded ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
                      <DashboardIcon icon={action.icon} className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors truncate">{action.label}</span>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5" />
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-white/5 px-2 mb-2">
                <div className="bg-gradient-to-br from-primary/10 to-transparent p-3 rounded border border-primary/10">
                  <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Verification Index</h5>
                  <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary w-[85%]" />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Audit Strength</span>
                    <span className="text-[9px] font-black text-primary">85.4%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
