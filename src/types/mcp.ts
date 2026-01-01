export interface MCPAccount {
    id: string;
    name: string;
    source: 'ZERODHA' | 'CAMS' | 'CAS' | 'AGENT' | 'MANUAL';
    lastSynced: string;
    accountNumber?: string;
}

export interface MCPTransaction {
    id: string;
    accountId: string;
    date: string;
    type: 'BUY' | 'SELL' | 'DIVIDEND' | 'BONUS' | 'SPLIT';
    instrument: {
        symbol: string;
        isin: string;
        name: string;
        type: 'STOCK' | 'MUTUAL_FUND' | 'ETF' | 'BOND';
    };
    quantity: number;
    price: number;
    currency: string;
    totalAmount: number;
}

export interface MCPHolding {
    id: string;
    accountId: string;
    instrument: {
        symbol: string;
        isin: string;
        name: string;
        type: 'STOCK' | 'MUTUAL_FUND' | 'ETF' | 'BOND';
        category?: string;
        sector?: string;
    };
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercentage: number;
    allocationPercentage: number;
}

export interface MCPMarketData {
    instrumentMaster: Record<string, {
        symbol: string;
        isin: string;
        name: string;
        type: string;
        sector?: string;
        category?: string;
    }>;
    priceSnapshot: Record<string, {
        price: number;
        change: number;
        changePercentage: number;
        timestamp: string;
    }>;
}

export interface MCPPortfolioMetrics {
    totalInvested: number;
    currentValue: number;
    totalPnl: number;
    totalPnlPercentage: number;
    xirr: number;
    allocationBreakdown: {
        byAssetType: Record<string, number>;
        bySector: Record<string, number>;
    };
    riskMetrics: {
        beta: number;
        standardDeviation: number;
        sharpeRatio: number;
    };
}

export interface MCPInvestmentInsight {
    observation: string;
    whyThisMatters: string;
    evidence: string;
    suggestedAction?: string;
    confidenceLevel: number;
}

export interface MCPContext {
    version: string;
    timestamp: string;
    accounts: MCPAccount[];
    transactions: MCPTransaction[];
    holdings: MCPHolding[];
    marketData: MCPMarketData;
    metrics: MCPPortfolioMetrics;
    insights: MCPInvestmentInsight[];
    constraints: {
        riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
        investmentHorizon: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
    };
}
