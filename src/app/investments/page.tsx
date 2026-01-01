"use client";

import { useEffect, useState, useRef } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mcpManager } from '@/lib/mcp/manager';
import { ingestionAgent, analyticsAgent, insightsAgent } from '@/lib/agents/InvestmentAgents';
import { MCPContext } from '@/types/mcp';
import { formatCurrency } from '@/lib/utils';
import { InsightCard } from '@/components/investments/InsightCard';
import { exportInvestmentsToExcel } from '@/lib/export';
import {
    TrendingUp,
    Wallet,
    Shield,
    Upload,
    ArrowUpRight,
    Database,
    BarChart3,
    Cpu,
    History,
    Activity,
    Layers,
    FileText,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Download
} from 'lucide-react';

export default function InvestmentsPage() {
    const [context, setContext] = useState<MCPContext | null>(null);
    const [loadingType, setLoadingType] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSource, setActiveSource] = useState<'ZERODHA' | 'CAMS' | null>(null);
    const [activeTab, setActiveTab] = useState<'STOCKS' | 'MUTUAL_FUNDS' | 'COMBINED'>('COMBINED');

    useEffect(() => {
        setMounted(true);
        setContext(mcpManager.getContext());
    }, []);

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all investment data? This will reset your MCP registry.")) {
            mcpManager.clearContext();
            setContext(mcpManager.getContext());
        }
    };

    const handleExport = () => {
        if (context) {
            exportInvestmentsToExcel(context);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeSource) return;

        setLoadingType(activeSource);
        try {
            const currentContext = mcpManager.getContext();

            // 1. Ingestion Agent - Parse and Merge (Detect Duplicates)
            const { account, holdings } = await ingestionAgent.parseStatement(file, activeSource);

            // AI Agent logic: Detect overlaps and generate clean records
            const { accounts: mergedAccounts, holdings: mergedHoldings } =
                ingestionAgent.mergeRecords(currentContext, account, holdings);

            // 2. Analytics Agent
            const metrics = analyticsAgent.calculateMetrics(mergedHoldings);

            // 3. Insights Agent
            const insights = insightsAgent.generateInsights(metrics, mergedHoldings);

            // 4. MCP Context Update
            const updatedContext: MCPContext = {
                ...currentContext,
                accounts: mergedAccounts,
                holdings: mergedHoldings,
                metrics,
                insights,
                timestamp: new Date().toISOString()
            };

            mcpManager.saveContext(updatedContext);
            setContext(updatedContext);
        } catch (error: any) {
            console.error("Ingestion failed:", error);
            alert(error.message || "An unexpected error occurred during ingestion.");
        } finally {
            setLoadingType(null);
            setActiveSource(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = (source: 'ZERODHA' | 'CAMS') => {
        setActiveSource(source);
        fileInputRef.current?.click();
    };

    if (!mounted || !context) return null;

    const hasData = context.holdings.length > 0;

    const filteredHoldings = context.holdings.filter(h => {
        if (activeTab === 'STOCKS') return h.instrument.type === 'STOCK';
        if (activeTab === 'MUTUAL_FUNDS') return h.instrument.type === 'MUTUAL_FUND';
        return true;
    });

    return (
        <Layout>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.pdf,.xlsx"
                onChange={handleFileUpload}
            />

            <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Asset Intelligence Hub</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Investment Umbrella</h2>
                        <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest flex items-center">
                            <Database className="h-3 w-3 mr-1.5" /> MCP Registry: {context.accounts.length} Nodes Active
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="glass-card border-white/10 text-[9px] font-black uppercase tracking-widest h-9 hover:bg-primary/10 hover:border-primary/30"
                            onClick={() => triggerUpload('ZERODHA')}
                            disabled={!!loadingType}
                        >
                            {loadingType === 'ZERODHA' ? (
                                <Activity className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                            )}
                            Upload Zerodha CSV
                        </Button>
                        <Button
                            variant="outline"
                            className="glass-card border-white/10 text-[9px] font-black uppercase tracking-widest h-9 hover:bg-blue-500/10 hover:border-blue-500/30"
                            onClick={() => triggerUpload('CAMS')}
                            disabled={!!loadingType}
                        >
                            {loadingType === 'CAMS' ? (
                                <Activity className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-3.5 w-3.5 text-blue-500" />
                            )}
                            Ingest CAMS PDF
                        </Button>
                        <div className="h-6 w-px bg-white/10 mx-1" />
                        <Button
                            variant="outline"
                            className="glass-card border-white/10 text-[9px] font-black uppercase tracking-widest h-9 text-white/40 hover:text-white"
                            onClick={handleExport}
                            disabled={!hasData}
                        >
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Download Portfolio
                        </Button>
                        <Button
                            variant="outline"
                            className="glass-card border-white/10 text-[9px] font-black uppercase tracking-widest h-9 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20"
                            onClick={handleClearAll}
                            disabled={!hasData}
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Clear Registry
                        </Button>
                    </div>
                </div>

                {hasData ? (
                    <div className="grid gap-6">
                        {/* Top Level Intelligence Matrix */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    label: 'Total Invested Capital',
                                    value: formatCurrency(context.metrics.totalInvested),
                                    trend: 'Principal',
                                    sub: 'Historical Cost Basis',
                                    color: 'text-white/70'
                                },
                                {
                                    label: 'Current Portfolio Value',
                                    value: formatCurrency(context.metrics.currentValue),
                                    trend: `${((context.metrics.currentValue / (context.metrics.totalInvested || 1) - 1) * 100).toFixed(1)}%`,
                                    sub: 'Live Registry Valuation',
                                    color: 'text-white'
                                },
                                {
                                    label: 'Overall Capital Gains',
                                    value: formatCurrency(context.metrics.totalPnl),
                                    trend: `${context.metrics.totalPnlPercentage.toFixed(1)}%`,
                                    sub: 'Absolute Delta',
                                    color: context.metrics.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'
                                },
                                {
                                    label: 'Registry Density',
                                    value: `${context.holdings.length} Nodes`,
                                    trend: 'Tracked',
                                    sub: 'Unique Asset Clusters',
                                    color: 'text-orange-500'
                                }
                            ].map((m, i) => (
                                <Card key={i} className="glass-card border-none bg-white/[0.02] p-4 relative group overflow-hidden border-t border-t-white/5">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Activity className="h-20 w-20" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mb-4 block leading-none">{m.label}</span>
                                    <div className={`text-2xl font-black tracking-tighter ${m.color} mb-1 transition-all group-hover:translate-x-1`}>{m.value}</div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">{m.sub}</span>
                                        <Badge variant="secondary" className={`text-[8px] h-3.5 px-1 border-none ${m.trend.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {m.trend.startsWith('+') || !m.trend.includes('%') ? m.trend : `+${m.trend}`}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-12">
                            {/* Detailed Breakdown */}
                            <div className="lg:col-span-8 space-y-6">
                                <Card className="glass-card border-none overflow-hidden bg-black/40">
                                    <div className="p-4 border-b border-white/5 flex flex-col space-y-4 bg-white/[0.02]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Layers className="h-4 w-4 text-primary" />
                                                <h3 className="text-[11px] font-black uppercase tracking-widest text-white/80">Asset Registry</h3>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className="bg-primary/5 text-primary border-primary/20 text-[8px] h-4">
                                                    {filteredHoldings.length} Nodes
                                                </Badge>
                                                {loadingType && (
                                                    <span className="text-[9px] font-black text-primary animate-pulse tracking-widest uppercase">Parsing...</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Segmented Navigation */}
                                        <div className="flex p-1 bg-white/[0.03] rounded-lg border border-white/5 w-fit">
                                            {[
                                                { id: 'COMBINED', label: 'Combined' },
                                                { id: 'STOCKS', label: 'Stocks' },
                                                { id: 'MUTUAL_FUNDS', label: 'Mutual Funds' }
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === tab.id
                                                        ? 'bg-primary text-black'
                                                        : 'text-white/40 hover:text-white/60'
                                                        }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-white/[0.01] border-b border-white/5">
                                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-white/30 tracking-widest">Instrument</th>
                                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-white/30 tracking-widest text-right">Qty / Avg</th>
                                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-white/30 tracking-widest text-right">Current Value</th>
                                                        <th className="px-6 py-4 text-[9px] font-black uppercase text-white/30 tracking-widest text-right">P&L Delta</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {filteredHoldings.map((h) => (
                                                        <tr key={h.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-[13px] font-black text-white group-hover:text-primary transition-colors">{h.instrument.symbol}</span>
                                                                        <Badge variant="outline" className={`text-[7px] h-3 px-1 font-bold border-none uppercase ${h.instrument.type === 'STOCK' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                                                            }`}>
                                                                            {h.instrument.type.replace('_', ' ')}
                                                                        </Badge>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter max-w-[250px] truncate">{h.instrument.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-mono text-white/60">{h.quantity}</span>
                                                                    <span className="text-[10px] text-white/30">@ {formatCurrency(h.averagePrice)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="text-[12px] font-black text-white">{formatCurrency(h.currentValue)}</div>
                                                                <div className="text-[9px] font-bold text-white/20 uppercase">WGT: {h.allocationPercentage}%</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex flex-col">
                                                                    <span className={`text-[12px] font-black ${h.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                                                                    </span>
                                                                    <span className={`text-[9px] font-black ${h.pnl >= 0 ? 'text-emerald-500/40' : 'text-red-500/40'}`}>
                                                                        {h.pnlPercentage.toFixed(2)}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Agent Output */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center space-x-2">
                                            <Cpu className="h-4 w-4 text-primary" />
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-white">Agent Interpretations</h3>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] h-4 text-center">MCP INTEGRATED</Badge>
                                    </div>

                                    <div className="space-y-3">
                                        {context.insights.map((insight, idx) => (
                                            <InsightCard key={idx} insight={insight} />
                                        ))}
                                    </div>

                                    <Card className="bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                        <h5 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4 flex items-center">
                                            <BarChart3 className="h-3 w-3 mr-2" /> Exposure Vector
                                        </h5>
                                        <div className="space-y-3">
                                            {Object.entries(context.metrics.allocationBreakdown.byAssetType).map(([type, value]) => (
                                                <div key={type}>
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-1">
                                                        <span className="text-white/60">{type.replace('_', ' ')}</span>
                                                        <span className="text-white">{Math.round((value / context.metrics.currentValue) * 100)}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${(value / context.metrics.currentValue) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <div className="p-6 rounded-full bg-primary/5 mb-8 animate-pulse">
                            <TrendingUp className="h-12 w-12 text-primary/40" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neutral Monitoring Active</h3>
                        <p className="text-[12px] font-medium text-white/30 uppercase tracking-[0.2em] max-w-sm text-center mt-4">
                            Awaiting data ingestion. Upload your Zerodha CSV or CAMS CAS PDF to initialize the intelligence umbrella.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 w-full max-w-2xl px-6">
                            <Card onClick={() => triggerUpload('ZERODHA')} className="glass-card border-white/5 p-6 hover:bg-primary/5 transition-all cursor-pointer group border-l-2 border-l-transparent hover:border-l-primary">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-primary/10 rounded group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <h4 className="text-[12px] font-black uppercase text-white">Zerodha Gateway</h4>
                                </div>
                                <p className="text-[10px] text-white/40 uppercase leading-relaxed font-bold">
                                    Export your 'Holdings' CSV from Kite console and upload here for direct stock analysis.
                                </p>
                            </Card>

                            <Card onClick={() => triggerUpload('CAMS')} className="glass-card border-white/5 p-6 hover:bg-blue-500/5 transition-all cursor-pointer group border-l-2 border-l-transparent hover:border-l-blue-500">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded group-hover:scale-110 transition-transform">
                                        <Upload className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <h4 className="text-[12px] font-black uppercase text-white">MyCAMS / CAS PDF</h4>
                                </div>
                                <p className="text-[10px] text-white/40 uppercase leading-relaxed font-bold">
                                    Upload your Consolidated Account Statement (CAS) PDF. Our AI agent parses mutual fund folios.
                                </p>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Integration Instructions */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 text-center">Integration Roadmap</h4>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { step: "01", title: "Manual Ingestion", status: "Active", desc: "Upload CSV/PDF statements. The Ingestion Agent normalizes records into your local MCP context." },
                            { step: "02", title: "MCP Coordination", status: "Enabled", desc: "Structured financial context is shared across Analytics and Insights agents for explainable logic." },
                            { step: "03", title: "Live API Link", status: "Planned", desc: "Direct connectivity to Zerodha Kite Connect and CAMS APIs for real-time auto-refresh." }
                        ].map((s, i) => (
                            <div key={i} className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex items-center justify-between">
                                    <span className="text-[16px] font-black text-primary/40 italic tracking-tighter">{s.step}</span>
                                    <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">{s.status}</Badge>
                                </div>
                                <h5 className="text-[12px] font-black text-white/80 uppercase">{s.title}</h5>
                                <p className="text-[10px] text-white/40 font-medium leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
