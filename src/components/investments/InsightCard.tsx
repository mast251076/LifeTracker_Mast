import { MCPInvestmentInsight } from '@/types/mcp';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BrainCircuit, Info, Target, AlertCircle } from 'lucide-react';

export const InsightCard = ({ insight }: { insight: MCPInvestmentInsight }) => {
    return (
        <Card className="glass-card border-none bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden group">
            <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                            <BrainCircuit className="h-3.5 w-3.5" />
                        </div>
                        <h4 className="text-[12px] font-black uppercase tracking-tight text-white/90 group-hover:text-primary transition-colors">
                            {insight.observation}
                        </h4>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black h-4 px-1.5 border-white/10 text-white/40 group-hover:border-primary/30 group-hover:text-primary/60">
                        {insight.confidenceLevel}% AI CONFIDENCE
                    </Badge>
                </div>

                <div className="grid gap-3">
                    <div className="bg-white/[0.03] p-2.5 rounded border border-white/5">
                        <div className="flex items-center space-x-1.5 mb-1 opacity-40">
                            <Info className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Analysis</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/60 font-medium italic">
                            "{insight.evidence}"
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center space-x-1.5 mb-1 text-emerald-500/60">
                            <Target className="h-2.5 w-2.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Recommended Vector</span>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-tight pl-4 border-l border-emerald-500/20">
                            {insight.suggestedAction}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
