import { validateInvoiceAmountMatching } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-116: [normal] 請求書承認検証機能 - 請求書の金額が商談の見積金額と一致するとき、金額整合性検証を成功させる
  test('請求書の金額が商談の見積金額と一致するとき、金額整合性検証が成功し、ステータスが更新される', () => {
    const invoiceId = 'INV-20240115-001';
    const opportunityId = 'OPP-20240115-001';
    const invoiceAmount = 100000;
    const estimatedAmount = 100000;
    const currency = 'JPY';

    const mockInvoice = {
      id: invoiceId,
      opportunityId,
      amount: invoiceAmount,
      currency,
      status: '未確認',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const mockOpportunity = {
      id: opportunityId,
      estimatedAmount,
      currency,
      status: '商談中',
    };

    const mockAuditLogRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'LOG-20240115-001',
        action: '金額整合性検証：成功',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        userId: 'USER-PORTAL-001',
        recordId: invoiceId,
      }),
    };

    const mockInvoiceRepository = {
      findById: jest.fn().mockResolvedValue(mockInvoice),
      updateStatus: jest.fn().mockResolvedValue({
        ...mockInvoice,
        status: '金額確認済み',
      }),
    };

    const mockOpportunityRepository = {
      findById: jest.fn().mockResolvedValue(mockOpportunity),
    };

    const result = validateInvoiceAmountMatching(
      {
        invoiceId,
        opportunityId,
      },
      {
        invoiceRepository: mockInvoiceRepository,
        opportunityRepository: mockOpportunityRepository,
        auditLogRepository: mockAuditLogRepository,
      }
    );

    expect(result).toEqual({
      validationResult: 'MATCHED',
      message: '金額が商談の見積金額と一致しています',
      invoiceStatus: '金額確認済み',
      auditLogId: 'LOG-20240115-001',
    });

    expect(mockInvoiceRepository.findById).toHaveBeenCalledWith(invoiceId);
    expect(mockOpportunityRepository.findById).toHaveBeenCalledWith(opportunityId);

    expect(mockInvoiceRepository.updateStatus).toHaveBeenCalledWith(invoiceId, '金額確認済み');

    expect(mockAuditLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: '金額整合性検証：成功',
        recordId: invoiceId,
      })
    );
  });
});