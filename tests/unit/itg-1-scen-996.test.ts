import { generateShareLink } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-996: [normal] Google Drive API連携 - generateShareLinkが成功応答を受けた場合、一時的にアクセス可能な共有リンクが取得される
  test('generateShareLinkが成功応答を受けた場合、一時的にアクセス可能な共有リンクが取得される', () => {
    const documentId = 'doc_12345';
    const expirationTimeMs = 24 * 60 * 60 * 1000;
    const baseTime = new Date('2024-01-15T11:00:00Z').getTime();
    const expirationTimestamp = baseTime + expirationTimeMs;

    const mockDocumentStorageAdapter = {
      generateShareLink: jest.fn().mockResolvedValue({
        shareUrl: 'https://drive.google.com/file/d/doc_12345/view?usp=sharing&access_token=abc123def456',
        expirationTimestamp: expirationTimestamp,
        accessPermission: 'readOnly',
      }),
      uploadDocument: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const result = generateShareLink(documentId, mockDocumentStorageAdapter);

    return result.then((link) => {
      expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledWith(documentId);
      expect(link.shareUrl).toBe('https://drive.google.com/file/d/doc_12345/view?usp=sharing&access_token=abc123def456');
      expect(link.expirationTimestamp).toBe(expirationTimestamp);
      expect(link.accessPermission).toBe('readOnly');
      expect(link.shareUrl).toMatch(/^https:\/\/drive\.google\.com\//);
      expect(link.expirationTimestamp).toBeGreaterThan(baseTime);
      expect(link.accessPermission).toBe('readOnly');
    });
  });
});