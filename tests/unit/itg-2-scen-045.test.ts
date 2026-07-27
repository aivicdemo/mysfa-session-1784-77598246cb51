import { recordDocumentIssuanceHistory } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-045
  test('帳票発行履歴がシステムに記録されない場合にエラーとなる', async () => {
    const mockFetch = require('jest-fetch-mock');
    mockFetch.enableMocks();
    mockFetch.resetMocks();

    const documentIssuancePayload = {
      documentId: 'DOC-20240115-001',
      documentType: 'estimate',
      customerId: 'CUST-12345',
      issuanceDate: new Date('2024-01-15T11:00:00Z'),
      amount: 150000,
      userId: 'USER-789',
    };

    const historyRecordingFailureResponse = {
      success: false,
      errorCode: 'HISTORY_RECORDING_FAILED',
      errorMessage: '履歴記録',
      timestamp: '2024-01-15T11:00:30Z',
    };

    mockFetch.mockResponseOnce(JSON.stringify(historyRecordingFailureResponse), {
      status: 500,
    });

    expect(() =>
      recordDocumentIssuanceHistory(
        documentIssuancePayload.documentId,
        documentIssuancePayload.documentType,
        documentIssuancePayload.customerId,
        documentIssuancePayload.issuanceDate,
        documentIssuancePayload.amount,
        documentIssuancePayload.userId
      )
    ).toThrow(/履歴記録/);

    const fetchCallArgs = mockFetch.mock.calls[0];
    expect(fetchCallArgs[0]).toContain('history');
    expect(fetchCallArgs[1].method).toBe('POST');

    const requestBody = JSON.parse(fetchCallArgs[1].body);
    expect(requestBody.documentId).toBe('DOC-20240115-001');
    expect(requestBody.documentType).toBe('estimate');
    expect(requestBody.customerId).toBe('CUST-12345');
    expect(requestBody.amount).toBe(150000);
    expect(requestBody.userId).toBe('USER-789');

    mockFetch.disableMocks();
  });
});