import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-111
  test('[normal] 請求書承認検証機能 - 請求書が紐付く商談情報と顧客情報が存在するとき、参照情報を検証する', () => {
    // 入力データ準備
    const invoiceId = 'INV-20240115-001';
    const opportunityId = 'OPP-20240101-050';
    const customerId = 'CUST-20240001';
    const userId = 'USER-LOGIN-001';
    const authToken = 'mock-auth-token-xyz123';
    const currentTimestamp = new Date('2024-01-15T11:00:00Z');

    // スタブ: IdentityProviderAdapter
    const mockIdentityProvider = {
      authenticateUser: jest.fn().mockResolvedValue({ token: authToken }),
      validateToken: jest.fn().mockResolvedValue({ isValid: true, userId }),
      refreshToken: jest.fn().mockResolvedValue({ token: authToken }),
      revokeSession: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ: AuditLogExporter
    const mockAuditLogExporter = {
      logUserAccess: jest.fn().mockResolvedValue(undefined),
      logDataAccess: jest.fn().mockResolvedValue(undefined),
      logPermissionChange: jest.fn().mockResolvedValue(undefined),
      queryAuditLog: jest.fn().mockResolvedValue([]),
    };

    // データベースから取得した期待値（請求書に紐付く商談情報）
    const expectedOpportunityData = {
      opportunityId,
      opportunityName: 'エンタープライズシステム導入案件',
      invoiceAmount: 1500000,
      dueDate: '2024-03-31',
    };

    // データベースから取得した期待値（商談に紐付く顧客情報）
    const expectedCustomerData = {
      customerId,
      customerName: '株式会社テストシステムズ',
      registeredAddress: '東京都渋谷区桜丘町1-1',
      registeredEmailAddress: 'contact@test-systems.co.jp',
    };

    // テスト対象関数呼び出し
    const result = validateInvoiceApproval(
      {
        invoiceId,
        opportunityId,
        customerId,
        userId,
        authToken,
        requestTimestamp: currentTimestamp,
      },
      {
        identityProvider: mockIdentityProvider,
        auditLogExporter: mockAuditLogExporter,
      }
    );

    // 期待値の検証
    expect(result).toBeDefined();
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.opportunityId).toBe(opportunityId);
    expect(result.customerId).toBe(customerId);

    // 参照情報（商談情報）の検証
    expect(result.referenceData.opportunity).toEqual({
      opportunityId: expectedOpportunityData.opportunityId,
      opportunityName: expectedOpportunityData.opportunityName,
      invoiceAmount: expectedOpportunityData.invoiceAmount,
      dueDate: expectedOpportunityData.dueDate,
    });

    // 参照情報（顧客情報）の検証
    expect(result.referenceData.customer).toEqual({
      customerId: expectedCustomerData.customerId,
      customerName: expectedCustomerData.customerName,
      registeredAddress: expectedCustomerData.registeredAddress,
      registeredEmailAddress: expectedCustomerData.registeredEmailAddress,
    });

    // 参照情報取得日時の検証（±5分以内）
    const retrievalTimestamp = new Date(result.referenceData.retrievedAt);
    const fiveMinutesInMs = 5 * 60 * 1000;
    expect(
      Math.abs(retrievalTimestamp.getTime() - currentTimestamp.getTime())
    ).toBeLessThanOrEqual(fiveMinutesInMs);

    // AuditLogExporter の logDataAccess が呼び出されたことを検証
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        invoiceId,
        opportunityId,
        customerId,
        operationType: '参照',
        timestamp: expect.any(Date),
      })
    );

    // IdentityProviderAdapter の validateToken が呼び出されたことを検証
    expect(mockIdentityProvider.validateToken).toHaveBeenCalledWith(authToken);

    // 結果内の処理成功フラグの検証
    expect(result.isApprovalValidationSuccessful).toBe(true);
  });
});