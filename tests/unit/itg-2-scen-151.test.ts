import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generateAndUploadDocument } from '../../src/logic/it-1784969823049-2-1-2';

describe('Customer Portal - Document Upload Failure Handling', () => {
  // SCEN-151: [error] Google Drive API連携 - uploadDocumentが失敗した場合、利用者に「文書の保存に失敗しました。システム管理者に連絡してください」メッセージが表示される
  test('should display error message when DocumentStorageAdapter.uploadDocument fails', async () => {
    const authenticatedUserSessionToken = 'valid_session_token_12345';
    const documentContent = {
      type: 'invoice' as const,
      customerId: 'CUST-001',
      amount: 150000,
      dueDate: '2024-02-15',
      lineItems: [
        { description: 'Product A', quantity: 1, unitPrice: 100000 },
        { description: 'Service B', quantity: 1, unitPrice: 50000 }
      ]
    };

    const mockDocumentStorageAdapterWithFailure = {
      uploadDocument: jest.fn().mockRejectedValue(
        new Error('Network timeout during upload')
      ),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn()
    };

    const result = await generateAndUploadDocument(
      authenticatedUserSessionToken,
      documentContent,
      mockDocumentStorageAdapterWithFailure
    );

    expect(mockDocumentStorageAdapterWithFailure.uploadDocument).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('文書の保存に失敗しました。システム管理者に連絡してください');
    expect(result.userCanContinueOperations).toBe(true);
  });
});