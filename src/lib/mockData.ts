import { AppData } from '@/types';

export const mockAppData: AppData = {
    profile: {
        id: 'user_1',
        name: 'Arjun Kumar',
        email: 'arjun@example.com',
        currencyPreference: 'INR',
        themePreference: 'system',
        isSetupComplete: true,
    },
    assets: [
        {
            id: 'asset_1',
            name: 'HDFC Savings',
            type: 'BANK_ACCOUNT',
            ownership: 'SELF',
            status: 'ACTIVE',
            currentValue: { amount: 150000, currency: 'INR' },
            lastUpdated: "2024-01-01T12:00:00.000Z",
            details: {
                bankName: 'HDFC Bank',
                accountType: 'SAVINGS',
                accountNumber: 'xxxx-1234',
            }
        },
        {
            id: 'asset_2',
            name: 'Nifty 50 Index Fund',
            type: 'INVESTMENT',
            ownership: 'SELF',
            status: 'ACTIVE',
            currentValue: { amount: 500000, currency: 'INR' },
            lastUpdated: "2024-01-01T12:00:00.000Z",
            details: {
                investmentType: 'MUTUAL_FUND',
                symbol: 'NIFTYBEES',
                platform: 'Zerodha',
            }
        },
        {
            id: 'asset_3',
            name: '3BHK Apartment',
            type: 'REAL_ESTATE',
            ownership: 'JOINT',
            status: 'ACTIVE',
            currentValue: { amount: 12500000, currency: 'INR' },
            lastUpdated: "2024-01-01T12:00:00.000Z",
            details: {
                propertyType: 'FLAT',
                city: 'Bangalore',
                area: { value: 1650, unit: 'SQ_FT' },
                possessionDate: '2023-05-15'
            }
        }
    ],
    liabilities: [
        {
            id: 'liability_1',
            name: 'Home Loan',
            type: 'LOAN',
            status: 'ACTIVE',
            outstandingAmount: { amount: 2500000, currency: 'INR' },
            lastUpdated: "2024-01-01T12:00:00.000Z",
            details: {
                loanType: 'HOME',
                lender: 'SBI',
                principalAmount: { amount: 3000000, currency: 'INR' },
                interestRate: 8.5,
                isFloatingInterest: true,
                tenureMonths: 240,
                emiAmount: { amount: 26000, currency: 'INR' }
            }
        }
    ],
    incomeSources: [
        {
            id: 'inc_1',
            name: 'Primary Salary',
            type: 'SALARY',
            amount: { amount: 120000, currency: 'INR' },
            frequency: 'MONTHLY',
            isTaxable: true
        }
    ],
    expenses: [
        {
            id: 'exp_1',
            amount: { amount: 45000, currency: 'INR' },
            date: "2024-01-15T10:00:00.000Z",
            category: 'VARIABLE',
            subCategory: 'RENT',
            merchant: 'Homeowner',
            paymentInstrumentId: 'inst_1',
            isRecurring: true
        }
    ],
    paymentInstruments: [
        {
            id: 'inst_1',
            name: 'Primary Bank',
            type: 'UPI_APP',
            status: 'ACTIVE'
        }
    ],
    documents: [
        {
            id: 'doc_1',
            title: 'Aadhaar Card',
            category: 'IDENTITY',
            lastUpdated: "2024-01-01T12:00:00.000Z",
        }
    ],
    vaultEntries: [
        {
            id: 'v_1',
            title: 'Primary Email',
            category: 'PASSWORD',
            username: 'arjun@gmail.com',
            password: 'password123',
            lastUpdated: "2024-01-01T12:00:00.000Z"
        }
    ],
    lifeEvents: [],
};
