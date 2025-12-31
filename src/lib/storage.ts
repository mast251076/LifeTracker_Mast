import { AppData, Asset, Liability, IncomeSource, Expense, AppDocument, VaultEntry } from '@/types';

const STORAGE_KEY = 'personal-life-tracker-data';

const initialData: AppData = {
    profile: {
        id: 'user_1',
        name: 'User',
        currencyPreference: 'INR',
        themePreference: 'system',
        isSetupComplete: false,
    },
    assets: [],
    liabilities: [],
    incomeSources: [],
    expenses: [],
    paymentInstruments: [],
    documents: [],
    vaultEntries: [],
    lifeEvents: [],
};

class StorageService {
    private memoryStore: Record<string, string> = {};

    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    getItem(key: string): string | null {
        if (this.isBrowser()) {
            return localStorage.getItem(key);
        }
        return this.memoryStore[key] || null;
    }

    setItem(key: string, value: string): void {
        if (this.isBrowser()) {
            localStorage.setItem(key, value);
        } else {
            this.memoryStore[key] = value;
        }
    }

    removeItem(key: string): void {
        if (this.isBrowser()) {
            localStorage.removeItem(key);
        } else {
            delete this.memoryStore[key];
        }
    }

    // App specific methods
    getAppData(): AppData {
        const dataStr = this.getItem(STORAGE_KEY);
        if (!dataStr || dataStr === 'null') return initialData;
        try {
            const parsed = JSON.parse(dataStr);
            return (parsed && typeof parsed === 'object') ? parsed : initialData;
        } catch (error) {
            console.error('Failed to parse app data', error);
            return initialData;
        }
    }

    saveAppData(data: AppData): void {
        this.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // --- Assets ---
    updateAsset(updatedAsset: Asset): void {
        const data = this.getAppData();
        const index = data.assets.findIndex(a => a.id === updatedAsset.id);
        if (index !== -1) {
            data.assets[index] = updatedAsset;
            this.saveAppData(data);
        }
    }

    deleteAsset(id: string): void {
        const data = this.getAppData();
        data.assets = data.assets.filter(a => a.id !== id);
        this.saveAppData(data);
    }

    // --- Liabilities ---
    updateLiability(updatedLiability: Liability): void {
        const data = this.getAppData();
        const index = data.liabilities.findIndex(l => l.id === updatedLiability.id);
        if (index !== -1) {
            data.liabilities[index] = updatedLiability;
            this.saveAppData(data);
        }
    }

    deleteLiability(id: string): void {
        const data = this.getAppData();
        data.liabilities = data.liabilities.filter(l => l.id !== id);
        this.saveAppData(data);
    }

    // --- Income ---
    updateIncomeSource(updatedIncome: IncomeSource): void {
        const data = this.getAppData();
        const index = data.incomeSources.findIndex(i => i.id === updatedIncome.id);
        if (index !== -1) {
            data.incomeSources[index] = updatedIncome;
            this.saveAppData(data);
        }
    }

    deleteIncomeSource(id: string): void {
        const data = this.getAppData();
        data.incomeSources = data.incomeSources.filter(i => i.id !== id);
        this.saveAppData(data);
    }

    // --- Expenses ---
    updateExpense(updatedExpense: Expense): void {
        const data = this.getAppData();
        const index = data.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            data.expenses[index] = updatedExpense;
            this.saveAppData(data);
        }
    }

    deleteExpense(id: string): void {
        const data = this.getAppData();
        data.expenses = data.expenses.filter(e => e.id !== id);
        this.saveAppData(data);
    }

    // --- Documents ---
    updateDocument(doc: AppDocument): void {
        const data = this.getAppData();
        const index = data.documents.findIndex(d => d.id === doc.id);
        if (index !== -1) {
            data.documents[index] = doc;
        } else {
            data.documents.push(doc);
        }
        this.saveAppData(data);
    }

    deleteDocument(id: string): void {
        const data = this.getAppData();
        data.documents = data.documents.filter(d => d.id !== id);
        this.saveAppData(data);
    }

    // --- Vault ---
    updateVaultEntry(entry: VaultEntry): void {
        const data = this.getAppData();
        const index = data.vaultEntries.findIndex(v => v.id === entry.id);
        if (index !== -1) {
            data.vaultEntries[index] = entry;
        } else {
            data.vaultEntries.push(entry);
        }
        this.saveAppData(data);
    }

    deleteVaultEntry(id: string): void {
        const data = this.getAppData();
        data.vaultEntries = data.vaultEntries.filter(v => v.id !== id);
        this.saveAppData(data);
    }

    // --- Profile ---
    updateProfile(updatedProfile: AppData['profile']): void {
        const data = this.getAppData();
        data.profile = updatedProfile;
        this.saveAppData(data);
    }

    // --- System ---
    resetData(): void {
        this.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
}

export const storage = new StorageService();
