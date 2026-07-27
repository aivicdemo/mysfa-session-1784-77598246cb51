import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { reconcileOrderStatusAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let mockDocumentStorageAdapter: any;
  let mockDatabase: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: expect.any(String),
        status: 'success'
      })
    };

    mockDatabase = {
      getOrderByStatus: jest.fn(),
      getInvoicesByOrderId: jest.fn(),
      insertReconciliationResult: jest.fn(),
      updateReconciliationStatus: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-510
  test('[edge] 商談ステータスが「受注」で請求書が複数件のとき、全請求書が照合される', async () => {
    const orderId = 'ORDER-20240101-001';
    const orderData = {
      id: orderId,
      status: '受注',
      customerId: 'CUST-12345',
      amount: 180000,
      createdAt: new Date('2024-01-05T10:00:00Z')
    };

    const invoiceA = {
      id: 'INV-001',
      orderId: orderId,
      amount: 100000,
      issuedAt: new Date('2024-01-10T09:00:00Z'),
      status: '発行済み'
    };

    const invoiceB = {
      id: 'INV-002',
      orderId: orderId,
      amount: 50000,
      issuedAt: new Date('2024-01-15T14:30:00Z'),
      status: '発行済み'
    };

    const invoiceC = {
      id: 'INV-003',
      orderId: orderId,
      amount: 30000,
      issuedAt: new Date('2024-01-20T11:15:00Z'),
      status: '発行済み'
    };

    const invoiceList = [invoiceA, invoiceB, invoiceC];

    mockDatabase.getOrderByStatus.mockResolvedValue([orderData]);
    mockDatabase.getInvoicesByOrderId.mockResolvedValue(invoiceList);
    mockDatabase.insertReconciliationResult.mockResolvedValue({
      reconciliationId: 'REC-2024-001'
    });
    mockDatabase.updateReconciliationStatus.mockResolvedValue({
      updatedCount: 3
    });

    const reconciliationParams = {
      orderId: orderId,
      targetStatus: '受注',
      documentStorage: mockDocumentStorageAdapter,
      database: mockDatabase
    };

    const result = await reconcileOrderStatusAndInvoices(reconciliationParams);

    expect(result).toBeDefined();
    expect(result.reconciliationId).toBe('REC-2024-001');
    expect(result.processedInvoiceCount).toBe(3);
    expect(result.reconciliationStatus).toBe('照合完了');
    expect(result.discrepancyDetected).toBe(false);

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        invoiceId: 'INV-001'
      })
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        invoiceId: 'INV-002'
      })
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        invoiceId: 'INV-003'
      })
    );

    expect(mockDatabase.getOrderByStatus).toHaveBeenCalledWith('受注');
    expect(mockDatabase.getInvoicesByOrderId).toHaveBeenCalledWith(orderId);

    expect(mockDatabase.insertReconciliationResult).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: orderId,
        invoiceCount: 3,
        totalAmount: 180000
      })
    );

    expect(mockDatabase.updateReconciliationStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        reconciliationId: 'REC-2024-001',
        status: '照合完了'
      })
    );

    const reconciliationDetails = result.reconciliationDetails;
    expect(reconciliationDetails).toBeDefined();
    expect(reconciliationDetails.length).toBe(3);

    expect(reconciliationDetails[0]).toEqual(
      expect.objectContaining({
        invoiceId: 'INV-001',
        amount: 100000,
        issuedAt: new Date('2024-01-10T09:00:00Z'),
        reconciliationStatus: '照合完了'
      })
    );

    expect(reconciliationDetails[1]).toEqual(
      expect.objectContaining({
        invoiceId: 'INV-002',
        amount: 50000,
        issuedAt: new Date('2024-01-15T14:30:00Z'),
        reconciliationStatus: '照合完了'
      })
    );

    expect(reconciliationDetails[2]).toEqual(
      expect.objectContaining({
        invoiceId: 'INV-003',
        amount: 30000,
        issuedAt: new Date('2024-01-20T11:15:00Z'),
        reconciliationStatus: '照合完了'
      })
    );
  });
});