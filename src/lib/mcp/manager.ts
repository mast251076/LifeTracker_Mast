import { MCPContext } from '@/types/mcp';

const STORAGE_KEY = 'life_tracker_mcp_context';

export class MCPManager {
    private static instance: MCPManager;
    private context: MCPContext;

    private constructor() {
        this.context = this.loadContext();
    }

    public static getInstance(): MCPManager {
        if (!MCPManager.instance) {
            MCPManager.instance = new MCPManager();
        }
        return MCPManager.instance;
    }

    private loadContext(): MCPContext {
        if (typeof window === 'undefined') return this.getInitialContext();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return this.getInitialContext();
    }

    private getInitialContext(): MCPContext {
        return {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            accounts: [],
            transactions: [],
            holdings: [],
            marketData: {
                instrumentMaster: {},
                priceSnapshot: {}
            },
            metrics: {
                totalInvested: 0,
                currentValue: 0,
                totalPnl: 0,
                totalPnlPercentage: 0,
                xirr: 0,
                allocationBreakdown: { byAssetType: {}, bySector: {} },
                riskMetrics: { beta: 0, standardDeviation: 0, sharpeRatio: 0 }
            },
            insights: [],
            constraints: { riskProfile: 'MODERATE', investmentHorizon: 'LONG_TERM' }
        };
    }

    public clearContext() {
        this.context = this.getInitialContext();
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    public saveContext(context: MCPContext) {
        this.context = { ...context, timestamp: new Date().toISOString() };
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.context));
        }
    }

    public getContext(): MCPContext {
        // If not initialized (SSR case where it might have returned default), 
        // try to reload if we are now on client
        if (typeof window !== 'undefined' && this.context.accounts.length === 0) {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) this.context = JSON.parse(saved);
        }
        return this.context;
    }
}

export const mcpManager = MCPManager.getInstance();
