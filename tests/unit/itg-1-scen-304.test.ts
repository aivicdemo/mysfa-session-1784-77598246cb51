import { jest } from "@jest/globals";
import { updateInvoiceStatusAndUnlinkDeal } from "../../src/logic/it-1784969823049-1-1-1";

// Mock types for DocumentStorageAdapter
interface DocumentStorageAdapter {
  deleteDocument: jest.Mock<Promise<void>>;
  uploadDocument: jest.Mock<Promise<string>>;
  generateShareLink: jest.Mock<Promise<string>>;
}

// Mock types for database operations
interface DealRecord {
  dealId: string;
  customerId: string;
  dealName: string;
  amount: number;
}

interface InvoiceRecord {
  invoiceId: string;
  dealId: string;
  customerId: string;
  amount: number;
  status: "未発行" | "発行済み" | "キャンセル";
}

interface DealInvoiceLinkage {
  dealId: string;
  invoiceId: string;
}

// Mock database state
let mockDealDatabase: Map<string, DealRecord> = new Map();
let mockInvoiceDatabase: Map<string, InvoiceRecord> = new Map();
let mockLinkageDatabase: Map<string, DealInvoiceLinkage> = new Map();

describe("商談ステータスと請求データの紐付け・可視化 - 請求書キャンセル時の紐付け解除", () => {
  beforeEach(() => {
    mockDealDatabase.clear();
    mockInvoiceDatabase.clear();
    mockLinkageDatabase.clear();
  });

  // SCEN-304
  test("請求書ステータスがキャンセルに更新されると、商談と請求書の紐付けが完全に解除される", async () => {
    // Setup: テスト用の商談レコードを作成
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const invoiceId = "INV-001";
    const dealRecord: DealRecord = {
      dealId,
      customerId,
      dealName: "Test Deal",
      amount: 100000,
    };
    mockDealDatabase.set(dealId, dealRecord);

    // Setup: 商談に紐付く請求書レコードを作成し、ステータスを『未発行』に設定
    const invoiceRecord: InvoiceRecord = {
      invoiceId,
      dealId,
      customerId,
      amount: 100000,
      status: "未発行",
    };
    mockInvoiceDatabase.set(invoiceId, invoiceRecord);

    // Setup: 商談と請求書の紐付けを確立
    const linkageKey = `${dealId}-${invoiceId}`;
    mockLinkageDatabase.set(linkageKey, { dealId, invoiceId });

    // Verify: 紐付けが正常に確立されたことを確認
    expect(mockLinkageDatabase.has(linkageKey)).toBe(true);
    const initialLinkage = mockLinkageDatabase.get(linkageKey);
    expect(initialLinkage).toEqual({ dealId, invoiceId });

    // Setup: DocumentStorageAdapter のスタブを作成
    const mockDocumentStorageAdapter: DocumentStorageAdapter = {
      deleteDocument: jest.fn(async () => {
        // Simulate successful deletion
        return Promise.resolve();
      }),
      uploadDocument: jest.fn(async () => "mock-file-id"),
      generateShareLink: jest.fn(async () => "mock-share-link"),
    };

    // Execute: 請求書ステータスを『キャンセル』に更新し、紐付けを解除
    await updateInvoiceStatusAndUnlinkDeal(
      invoiceId,
      "キャンセル",
      dealId,
      mockDocumentStorageAdapter,
      {
        queryDeal: async (id: string) => mockDealDatabase.get(id),
        queryInvoice: async (id: string) => mockInvoiceDatabase.get(id),
        updateInvoiceStatus: async (id: string, status: string) => {
          const inv = mockInvoiceDatabase.get(id);
          if (inv) {
            inv.status = status as "未発行" | "発行済み" | "キャンセル";
            mockInvoiceDatabase.set(id, inv);
          }
        },
        deleteLinkage: async (key: string) => {
          mockLinkageDatabase.delete(key);
        },
        getLinkageKey: (dId: string, iId: string) => `${dId}-${iId}`,
      }
    );

    // Verify: ステータス更新後、紐付けテーブルの該当レコードが削除されている
    expect(mockLinkageDatabase.has(linkageKey)).toBe(false);

    // Verify: UI 上で商談詳細画面に請求書情報が表示されない
    const dealDetails = mockDealDatabase.get(dealId);
    expect(dealDetails).toBeDefined();
    const invoiceStillLinked = Array.from(mockLinkageDatabase.values()).find(
      (link) => link.dealId === dealId && link.invoiceId === invoiceId
    );
    expect(invoiceStillLinked).toBeUndefined();

    // Verify: DocumentStorageAdapter の deleteDocument が呼び出されたこと
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledWith(
      invoiceId
    );
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledTimes(1);

    // Verify: 請求書ステータスが『キャンセル』に更新されている
    const updatedInvoice = mockInvoiceDatabase.get(invoiceId);
    expect(updatedInvoice).toBeDefined();
    expect(updatedInvoice?.status).toBe("キャンセル");

    // Verify: 商談は請求書と無関連の状態になっている
    const allLinksForDeal = Array.from(mockLinkageDatabase.values()).filter(
      (link) => link.dealId === dealId
    );
    expect(allLinksForDeal.length).toBe(0);
  });
});