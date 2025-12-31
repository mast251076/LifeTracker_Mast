export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface Money {
    amount: number;
    currency: Currency;
}

export type OwnershipType = 'SELF' | 'SPOUSE' | 'JOINT' | 'DEPENDENT' | 'BUSINESS' | 'HUF';
export type AssetStatus = 'ACTIVE' | 'SOLD' | 'CLOSED' | 'ARCHIVED';

// --- Base Interface ---
interface BaseAsset {
    id: string;
    name: string; // Display Name
    description?: string;
    ownership: OwnershipType;
    status: AssetStatus;
    currentValue: Money;
    purchaseValue?: Money;
    purchaseDate?: string; // ISO Date
    lastUpdated: string; // ISO Date
    tags?: string[];
    notes?: string;
    attachments?: string[]; // IDs of documents
    customCategory?: string; // For 'OTHER' asset types
}

// --- Specific Asset Interfaces ---

export interface RealEstateAsset extends BaseAsset {
    type: 'REAL_ESTATE';
    details: {
        propertyType: 'FLAT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'AGRICULTURAL' | 'OTHER';
        address?: string;
        city?: string;
        pincode?: string;
        area?: { value: number; unit: 'SQ_FT' | 'SQ_YARD' | 'ACRE' | 'HECTARE' };
        khataNumber?: string;
        surveyNumber?: string;
        registrationDate?: string;
        possessionDate?: string;
        stampDutyPaid?: number;
        rentalYield?: number; // percentage
    };
}

export interface VehicleAsset extends BaseAsset {
    type: 'VEHICLE';
    details: {
        subType: 'CAR' | 'BIKE' | 'SCOOTER' | 'EV' | 'OTHER';
        make: string; // e.g. Honda
        model: string; // e.g. City
        variant?: string; // e.g. ZX CVT
        year?: number;
        registrationNumber?: string;
        chassisNumber?: string;
        engineNumber?: string;
        fuelType?: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG';
        insurancePolicyNumber?: string;
        insuranceExpiry?: string;
        pollutionExpiry?: string;
    };
}

export interface BankAccountAsset extends BaseAsset {
    type: 'BANK_ACCOUNT';
    details: {
        bankName: string;
        accountType: 'SAVINGS' | 'CURRENT' | 'NRE' | 'NRO' | 'FD' | 'RD' | 'PPF' | 'EPF';
        accountNumber?: string; // Masked usually
        ifsc?: string;
        branch?: string;
        nominee?: string;
        interestRate?: number;
        maturityDate?: string; // For FDs
        isJointHolder?: boolean;
        jointHolderName?: string;
    };
}

export interface InvestmentAsset extends BaseAsset {
    type: 'INVESTMENT';
    details: {
        investmentType: 'MUTUAL_FUND' | 'STOCK' | 'BOND' | 'ETF' | 'REIT' | 'AIF';
        symbol?: string; // e.g. HDFCBANK
        platform?: string; // e.g. Zerodha, Groww
        folioNumber?: string;
        quantity?: number;
        averagePrice?: number;
        isin?: string;
    };
}

export interface JewelleryAsset extends BaseAsset {
    type: 'JEWELLERY' | 'GOLD';
    details: {
        material: 'GOLD' | 'SILVER' | 'PLATINUM' | 'DIAMOND' | 'GEMSTONE' | 'MIXED';
        purity?: '24K' | '22K' | '18K' | '14K' | 'STERLING' | 'OTHER';
        weight?: { value: number; unit: 'GRAMS' | 'CARATS' | 'KILOS' };
        itemType?: 'NECKLACE' | 'RING' | 'BANGLES' | 'COIN' | 'BAR' | 'OTHER';
        hallmarked?: boolean;
        makingCharges?: number;
        certificateNumber?: string;
    };
}

export interface ElectronicsAsset extends BaseAsset {
    type: 'ELECTRONICS' | 'APPLIANCES';
    details: {
        category: 'LAPTOP' | 'MOBILE' | 'TV' | 'FRIDGE' | 'WASHING_MACHINE' | 'CAMERA' | 'OTHER';
        brand: string;
        model?: string;
        serialNumber?: string;
        warrantyExpiry?: string;
        invoiceNumber?: string;
        vendor?: string; // Where it was bought
    };
}

export interface OtherAsset extends BaseAsset {
    type: 'OTHER';
    customCategory: string; // The user-defined category
    details: Record<string, any>;
}

export interface RetirementAsset extends BaseAsset {
    type: 'RETIREMENT';
    details: {
        schemeType: 'EPF' | 'PPF' | 'NPS' | 'SSY' | 'GRAVITY' | 'OTHER';
        uan?: string;
        pran?: string; // NPS
        employerContribution?: Money;
        employeeContribution?: Money;
        maturityDate?: string;
        tier1Balance?: Money; // NPS
        tier2Balance?: Money; // NPS
        withdrawalLimit?: number; // %
    };
}

// --- Union Type ---
export type Asset =
    | RealEstateAsset
    | VehicleAsset
    | BankAccountAsset
    | InvestmentAsset
    | JewelleryAsset
    | ElectronicsAsset
    | RetirementAsset
    | OtherAsset;

export type AssetType = Asset['type'];


// --- Liabilities (Placeholder for now, but aligned) ---
// --- Liabilities ---

export type LiabilityType = 'LOAN' | 'CREDIT_CARD' | 'BORROWING' | 'OTHER';

interface BaseLiability {
    id: string;
    name: string;
    type: LiabilityType;
    status: 'ACTIVE' | 'CLOSED' | 'SETTLED' | 'DEFAULTED';
    outstandingAmount: Money;
    lastUpdated: string;
    tags?: string[];
    notes?: string;
}

export interface LoanLiability extends BaseLiability {
    type: 'LOAN';
    details: {
        loanType: 'HOME' | 'CAR' | 'PERSONAL' | 'EDUCATION' | 'BUSINESS' | 'GOLD' | 'OTHER';
        lender: string; // Bank Name
        loanAccountNumber?: string;
        principalAmount: Money;
        interestRate: number; // % per annum
        isFloatingInterest: boolean;
        tenureMonths: number;
        emiAmount?: Money;
        startDate?: string;
        endDate?: string; // Forecasted
        linkedAssetId?: string; // e.g. Home Loan linked to the House Asset
    };
}

export interface CreditCardLiability extends BaseLiability {
    type: 'CREDIT_CARD';
    details: {
        network: 'VISA' | 'MASTERCARD' | 'RUPAY' | 'AMEX' | 'DINERS' | 'OTHER';
        issuer: string; // Bank Name
        last4Digits?: string;
        creditLimit: Money;
        availableLimit?: Money;
        billingDay?: number; // 1-31
        dueDay?: number; // 1-31
        rewardPoints?: number;
        minDueAmount?: Money;
    };
}

export interface OtherLiability extends BaseLiability {
    type: 'BORROWING' | 'OTHER';
    details: Record<string, any>;
}

export type Liability = LoanLiability | CreditCardLiability | OtherLiability;


// --- Income ---

export type IncomeType = 'SALARY' | 'FREELANCE' | 'RENTAL' | 'DIVIDEND' | 'INTEREST' | 'OTHER';
export type IncomeFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME';

export interface IncomeSource {
    id: string;
    name: string;
    type: IncomeType;
    amount: Money; // Net Amount typically
    grossAmount?: Money;
    frequency: IncomeFrequency;
    receiveDate?: number; // e.g. 1st or 30th of month
    linkedAccountId?: string; // Where it is deposited
    isTaxable: boolean;
    notes?: string;
    details?: Record<string, any>;
}

// --- Expenses ---

export type ExpenseCategory = 'FIXED' | 'VARIABLE' | 'DISCRETIONARY' | 'SAVINGS' | 'INVESTMENT';
export type ExpenseSubCategory = 'RENT' | 'EMI' | 'FOOD' | 'TRAVEL' | 'SHOPPING' | 'UTILITIES' | 'HEALTH' | 'ENTERTAINMENT' | 'OTHER';

export interface Expense {
    id: string;
    amount: Money;
    date: string;
    category: ExpenseCategory;
    subCategory: ExpenseSubCategory;
    merchant?: string;
    paymentInstrumentId: string; // Link to Wallet or Liability(Credit Card) or Asset(Bank)
    description?: string;
    isRecurring: boolean;
    tags?: string[];
    receiptAttachmentId?: string;
    details?: Record<string, any>; // e.g. "Split with friends"
}

// --- Payment Instruments (Wallets / Virtual) ---

export type PaymentMethodType = 'UPI_APP' | 'WALLET' | 'CASH' | 'FOREX_CARD' | 'OTHER';

export interface PaymentInstrument {
    id: string;
    name: string; // e.g. "GPay", "Cash Wallet"
    type: PaymentMethodType;
    balance?: Money; // For wallets
    linkedAssetId?: string; // If GPay is linked to specific Bank Account Asset
    status: 'ACTIVE' | 'INACTIVE';
}

export type DocumentCategory = 'IDENTITY' | 'VEHICLE' | 'PROPERTY' | 'INSURANCE' | 'HEALTH' | 'FINANCE' | 'OTHER';

export interface AppDocument {
    id: string;
    title: string;
    category: DocumentCategory;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuer?: string;
    notes?: string;
    lastUpdated: string;
    attachmentIds?: string[];
    attachments?: {
        name: string;
        type: string;
        size: number;
        data: string; // Base64
    }[];
}

export type VaultCategory = 'PASSWORD' | 'BANK_PIN' | 'SECRET_NOTE' | 'RECOVERY_PHRASE' | 'OTHER';

export interface VaultEntry {
    id: string;
    title: string; // e.g. "Primary Gmail"
    category: VaultCategory;
    accountName?: string;
    username?: string;
    password?: string;
    secretNote?: string;
    lastUpdated: string;
}

export interface LifeEvent {
    id: string;
    title: string;
    date: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    currencyPreference: Currency;
    themePreference: 'light' | 'dark' | 'system';
    isSetupComplete: boolean;
}

export interface AppData {
    profile: UserProfile;
    assets: Asset[];
    liabilities: Liability[];
    incomeSources: IncomeSource[];
    expenses: Expense[];
    paymentInstruments: PaymentInstrument[];
    documents: AppDocument[];
    vaultEntries: VaultEntry[];
    lifeEvents: LifeEvent[];
}
