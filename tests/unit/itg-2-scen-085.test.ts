import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { issueOrderDocument } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル商談情報参照機能 - 帳票発行', () => {
  let mockDocumentStorageAdapter: any;
  let capturedOrderHistory: any[];

  beforeEach(() => {
    capturedOrderHistory = [];
    
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async (pdfData: Buffer, fileName: string) => {
        return {
          fileId: 'FILE-20240115-001',
          fileName: fileName,
          uploadedAt: '2024-01-15T11:30:00Z',
          status: 'success'
        };
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-085
  test('注文書発行時に顧客IDが発行履歴に正確に記録される', async () => {
    const customerId = 'CUST-20240115-001';
    const orderData = {
      customerId: customerId,
      productName: 'テスト商品',
      quantity: 1,
      amount: 10000,
      issuedAt: '2024-01-15T11:30:00Z'
    };

    const mockOrderHistoryStore = {
      records: [] as any[],
      addRecord: function(record: any) {
        this.records.push(record);
      },
      getRecords: function() {
        return this.records;
      }
    };

    const result = await issueOrderDocument(
      orderData,
      mockDocumentStorageAdapter,
      mockOrderHistoryStore
    );

    const addedRecords = mockOrderHistoryStore.getRecords();
    expect(addedRecords.length).toBe(1);

    const addedRecord = addedRecords[0];
    expect(addedRecord.customerId).toBe('CUST-20240115-001');
    expect(addedRecord.issuedAt).toBe('2024-01-15T11:30:00Z');
    expect(addedRecord.fileReferenceId).toBe('FILE-20240115-001');
    expect(addedRecord.status).toBe('発行完了');
    
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.fileId).toBe('FILE-20240115-001');
  });
});