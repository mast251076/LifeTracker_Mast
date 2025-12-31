import * as XLSX from 'xlsx';
import { storage } from '@/lib/storage';

/**
 * Exports application data to an Excel file with dynamic naming.
 * @param reportName The prefix for the filename (e.g., "Financial_Snapshot")
 */
export const exportDataToExcel = (reportName: string = "All_Life_Tracker_Data") => {
    console.log(`Exporting ${reportName} v1.3...`);

    const data = storage.getAppData();
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // 1. Assets Sheet
    const assetsData = (data.assets || []).map(asset => ({
        ID: asset.id,
        Name: asset.name,
        Type: asset.type,
        Value: asset.currentValue?.amount || 0,
        Currency: asset.currentValue?.currency || 'INR',
        Ownership: asset.ownership,
        Status: asset.status,
        LastUpdated: asset.lastUpdated
    }));
    const assetsSheet = XLSX.utils.json_to_sheet(assetsData);
    XLSX.utils.book_append_sheet(wb, assetsSheet, "Assets");

    // 2. Liabilities Sheet
    const liabilitiesData = (data.liabilities || []).map(liab => ({
        ID: liab.id,
        Name: liab.name,
        Type: liab.type,
        Outstanding: liab.outstandingAmount?.amount || 0,
        Currency: liab.outstandingAmount?.currency || 'INR',
        Status: liab.status,
        LastUpdated: liab.lastUpdated
    }));
    const liabilitiesSheet = XLSX.utils.json_to_sheet(liabilitiesData);
    XLSX.utils.book_append_sheet(wb, liabilitiesSheet, "Liabilities");

    // 3. Income Sheet
    const incomeData = (data.incomeSources || []).map(inc => ({
        ID: inc.id,
        Name: inc.name,
        Type: inc.type,
        Amount: inc.amount?.amount || 0,
        Currency: inc.amount?.currency || 'INR',
        Frequency: inc.frequency,
        Taxable: inc.isTaxable ? 'Yes' : 'No'
    }));
    const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
    XLSX.utils.book_append_sheet(wb, incomeSheet, "Income");

    // 4. Expenses Sheet
    const expensesData = (data.expenses || []).map(exp => ({
        ID: exp.id,
        Date: exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A',
        Merchant: exp.merchant,
        Category: exp.category,
        SubCategory: exp.subCategory,
        Amount: exp.amount?.amount || 0,
        Currency: exp.amount?.currency || 'INR',
        Method: exp.paymentInstrumentId
    }));
    const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(wb, expensesSheet, "Expenses");

    // Filename construction
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    // Use underscores instead of spaces for maximum browser compatibility
    const sanitizedName = reportName.replace(/\s+/g, '_');
    const fileName = `${sanitizedName}_${dd}${mm}${yyyy}.xlsx`;

    console.log("Generating file:", fileName);

    try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        const s2ab = (s: string) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        };

        // Use specific Excel MIME type
        const excelType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const blob = new Blob([s2ab(wbout)], { type: excelType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            console.log("Download complete:", fileName);
        }, 200);
    } catch (error) {
        console.error("Export failure:", error);
    }
};
