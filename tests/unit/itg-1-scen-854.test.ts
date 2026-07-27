import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-854
  test('請求書承認検証機能 - 請求書に紐付く商談のステータスが一致している場合、承認フラグが立つ', async () => {
    const invoiceId = 'INV-20240115-001';
    const opportunityId = 'OPP-20240110-005';
    
    const mockInvoice = {
      id: invoiceId,
      status: '承認待ち',
      opportunityId: opportunityId,
      amount: 150000,
      issuedDate: '2024-01-15',
      approvalFlag: false,
    };

    const mockOpportunity = {
      id: opportunityId,
      status: '契約成立',
      customerId: 'CUST-20240101-001',
      amount: 150000,
      closedDate: '2024-01-10',
    };

    const mockDataSource = {
      fetchInvoiceById: jest.fn().mockResolvedValue(mockInvoice),
      fetchOpportunityById: jest.fn().mockResolvedValue(mockOpportunity),
      updateInvoiceApprovalStatus: jest.fn().mockResolvedValue({
        id: invoiceId,
        status: '承認済み',
        approvalFlag: true,
      }),
    };

    const result = await validateInvoiceApproval(invoiceId, mockDataSource);

    expect(mockDataSource.fetchInvoiceById).toHaveBeenCalledWith(invoiceId);
    expect(mockDataSource.fetchOpportunityById).toHaveBeenCalledWith(opportunityId);
    
    expect(result.approvalFlag).toBe(true);
    expect(result.status).toBe('承認済み');
    expect(mockDataSource.updateInvoiceApprovalStatus).toHaveBeenCalledWith(
      invoiceId,
      expect.objectContaining({
        approvalFlag: true,
        status: '承認済み',
      })
    );
  });
});