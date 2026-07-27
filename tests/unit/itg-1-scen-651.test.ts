import { reconcileSalesAndInvoices } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-651
  test('対象売上実績が0件のとき、空の照合結果リストが返される', () => {
    const mockSalesDataSource = {
      fetchSalesRecords: jest.fn().mockResolvedValue([]),
    };

    const mockInvoiceDataSource = {
      fetchInvoices: jest.fn().mockResolvedValue([
        {
          invoiceId: 'INV001',
          dealId: 'DEAL001',
          invoiceAmount: 100000,
          invoiceDate: '2024-04-15',
        },
        {
          invoiceId: 'INV002',
          dealId: 'DEAL002',
          invoiceAmount: 250000,
          invoiceDate: '2024-04-20',
        },
        {
          invoiceId: 'INV003',
          dealId: 'DEAL003',
          invoiceAmount: 150000,
          invoiceDate: '2024-04-25',
        },
      ]),
    };

    return reconcileSalesAndInvoices(mockSalesDataSource, mockInvoiceDataSource).then(
      (reconciliationResults) => {
        expect(reconciliationResults).toEqual([]);
      }
    );
  });
});