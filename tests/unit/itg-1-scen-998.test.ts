import { generateAndSaveInvoice } from '../../src/logic/it-1-1';

const fetchMock = require('jest-fetch-mock');

describe('見積・注文・請求書の自動生成機能 - Google Drive API連携エラー時の代替動作', () => {
  // SCEN-998
  test('uploadDocumentが失敗した場合、ユーザーに「文書の保存に失敗しました」と表示され、代替動作として一時フォルダに保存される', async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn()
        .mockRejectedValueOnce(new Error('ネットワークタイムアウト'))
        .mockRejectedValueOnce(new Error('ネットワークタイムアウト'))
        .mockRejectedValueOnce(new Error('ネットワークタイムアウト')),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockFileSystemModule = {
      tempFolder: '/system/temp',
      savedFiles: [] as string[],
      saveToTemp: jest.fn((filename: string, content: string) => {
        mockFileSystemModule.savedFiles.push(filename);
        return `/system/temp/${filename}`;
      }),
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-A001',
      customerName: '株式会社テスト',
      totalAmount: 150000,
      issueDate: new Date('2024-01-15T11:00:00Z'),
      dueDate: new Date('2024-02-15T11:00:00Z'),
      items: [
        {
          description: 'コンサルティングサービス',
          quantity: 10,
          unitPrice: 15000,
          amount: 150000,
        },
      ],
    };

    const pdfContent = '%PDF-1.4\n...mock invoice pdf content...';

    const result = await generateAndSaveInvoice(
      invoiceData,
      pdfContent,
      mockDocumentStorageAdapter,
      mockFileSystemModule
    );

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);
    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/文書の保存に失敗/);
    expect(result.fallbackPath).toBe('/system/temp/INV-2024-001.pdf');
    expect(mockFileSystemModule.savedFiles).toContain('INV-2024-001.pdf');
    expect(result.userMessage).toBe('文書の保存に失敗しました。システム管理者に連絡してください');
    expect(result.manualDownloadAvailable).toBe(true);

    fetchMock.disableMocks();
  });
});