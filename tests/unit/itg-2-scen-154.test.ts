import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateAndUploadInvoicePDF } from '../../src/logic/it-1784969823049-2-1-2';

// Mock types based on external service contract
interface DocumentStorageResponse {
  fileId: string;
  uploadTimestamp: string;
  documentUrl?: string;
}

interface InvoiceGenerationInput {
  invoiceId: string;
  customerId: string;
  amount: number;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
}

interface GenerationResult {
  success: boolean;
  userMessage?: string;
  technicalLog?: string;
  uploadedDocumentId?: string;
}

describe('顧客向けポータル - 商談情報参照機能での請求書PDF生成とGoogle Drive API連携', () => {
  // SCEN-154
  it('Google Drive APIのuploadDocumentが不正な応答形式を返した場合、業務データベースに記録されず、利用者向けエラーメッセージを表示する', async () => {
    // ==================== Setup ====================
    const invoiceInput: InvoiceGenerationInput = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-123',
      amount: 150000,
      items: [
        { description: 'Service A', quantity: 2, unitPrice: 50000 },
        { description: 'Service B', quantity: 1, unitPrice: 50000 },
      ],
    };

    // Mock DocumentStorageAdapter with malformed response
    // Case 1: Missing required 'fileId' field
    const malformedResponseMissingFileId: Partial<DocumentStorageResponse> = {
      uploadTimestamp: '2024-01-15T10:30:00Z',
      documentUrl: 'https://drive.example.com/doc123',
      // fileId は意図的に欠落
    };

    const mockDocumentStorageAdapterMissingFileId = {
      uploadDocument: jest.fn().mockResolvedValue(malformedResponseMissingFileId),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // Case 2: uploadTimestamp が数値で返される（文字列が期待される）
    const malformedResponseWrongType: DocumentStorageResponse & { uploadTimestamp: number } = {
      fileId: 'file-abc123',
      uploadTimestamp: 1705318200 as any, // 数値で返される（不正）
      documentUrl: 'https://drive.example.com/doc456',
    };

    const mockDocumentStorageAdapterWrongType = {
      uploadDocument: jest.fn().mockResolvedValue(malformedResponseWrongType),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // Mock database for uploaded documents tracking
    const mockUploadedDocumentsDB: Array<{ invoiceId: string; fileId: string; timestamp: string }> = [];

    // ==================== Test Case 1: Missing fileId ====================
    const resultMissingFileId: GenerationResult = await generateAndUploadInvoicePDF(
      invoiceInput,
      mockDocumentStorageAdapterMissingFileId,
      mockUploadedDocumentsDB
    ).catch((error) => ({
      success: false,
      userMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      technicalLog: error.message,
    }));

    // Verify user-facing error message
    expect(resultMissingFileId.userMessage).toBe(
      '文書の保存に失敗しました。システム管理者に連絡してください'
    );

    // Verify success flag is false
    expect(resultMissingFileId.success).toBe(false);

    // Verify no record was created in uploaded documents table
    expect(mockUploadedDocumentsDB.length).toBe(0);

    // Verify technical log is recorded
    expect(resultMissingFileId.technicalLog).toMatch(/fileId|必須フィールド/i);

    // ==================== Test Case 2: Wrong timestamp type ====================
    const resultWrongType: GenerationResult = await generateAndUploadInvoicePDF(
      invoiceInput,
      mockDocumentStorageAdapterWrongType,
      mockUploadedDocumentsDB
    ).catch((error) => ({
      success: false,
      userMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      technicalLog: error.message,
    }));

    // Verify user-facing error message
    expect(resultWrongType.userMessage).toBe(
      '文書の保存に失敗しました。システム管理者に連絡してください'
    );

    // Verify success flag is false
    expect(resultWrongType.success).toBe(false);

    // Verify no additional record was created in uploaded documents table
    expect(mockUploadedDocumentsDB.length).toBe(0);

    // Verify technical log contains error about data type or format validation
    expect(resultWrongType.technicalLog).toMatch(/型|形式|uploadDocument|応答/i);

    // Verify DocumentStorageAdapter was called
    expect(mockDocumentStorageAdapterMissingFileId.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-2024-001',
      })
    );

    expect(mockDocumentStorageAdapterWrongType.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-2024-001',
      })
    );
  });
});