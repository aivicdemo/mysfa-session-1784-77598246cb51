import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  approveInvoiceAndDistribute,
} from '../../src/logic/it-1-2';

const fetchMock = require('jest-fetch-mock');

describe('商談ステータスと請求データの紐付け・可視化', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  it('SCEN-260: 経理担当者が請求書を承認した場合に統一フォーマットの請求書が顧客ポータルに自動配信される', async () => {
    // 前提: 経理担当者が請求書承認画面にアクセスし、未承認の請求書が存在する状態
    // 商談ステータスが「受注」または「完了」で、請求書が発行済みの状態
    const invoiceId = 'INV-2024-00123';
    const customerId = 'CUST-00456';
    const customerName = '株式会社テスト';
    const customerEmail = 'customer@test.jp';
    const invoiceAmount = 150000;
    const invoiceDueDate = '2024-02-29';
    const invoiceDetails = [
      {
        lineItemId: 'LINE-001',
        description: 'サービス提供',
        quantity: 1,
        unitPrice: 150000,
        lineTotal: 150000,
      },
    ];
    const dealStatus = '受注';
    const invoiceIssueDate = '2024-02-15';
    const accountId = 'ACC-00789';
    const approvalTimestamp = new Date('2024-02-15T10:30:00Z');

    // 発行直後の請求書データ（営業管理システムから抽出）
    const invoiceToApprove = {
      invoiceId,
      customerId,
      customerName,
      customerEmail,
      invoiceAmount,
      invoiceDueDate,
      invoiceDetails,
      dealStatus,
      invoiceIssueDate,
      accountId,
      status: '未承認',
      createdAt: '2024-02-15T09:00:00Z',
    };

    // Mock: 請求書承認APIの成功レスポンス
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        invoiceId,
        approvedAt: approvalTimestamp.toISOString(),
        approvedBy: 'user_accounting_001',
        status: '承認済み',
      }),
      { status: 200 }
    );

    // Mock: 顧客ポータル配信APIの成功レスポンス
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        distributionId: 'DIST-2024-00001',
        invoiceId,
        customerId,
        distributedAt: new Date('2024-02-15T10:32:00Z').toISOString(),
        format: 'unified',
        deliveryChannel: 'customer_portal',
        documentUrl: 'https://portal.example.com/invoices/INV-2024-00123',
        downloadUrl: 'https://portal.example.com/invoices/INV-2024-00123/download',
      }),
      { status: 200 }
    );

    // 実行: 経理担当者が請求書を承認し、顧客ポータルへ自動配信
    const result = await approveInvoiceAndDistribute({
      invoiceId,
      accountId,
      approverUserId: 'user_accounting_001',
      invoiceData: invoiceToApprove,
    });

    // 検証: 承認が成功
    expect(result.approvalStatus).toBe('承認済み');
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.approvedAt).toBe(approvalTimestamp.toISOString());

    // 検証: 統一フォーマットで顧客ポータルに配信
    expect(result.distribution.success).toBe(true);
    expect(result.distribution.format).toBe('unified');
    expect(result.distribution.deliveryChannel).toBe('customer_portal');

    // 検証: 顧客情報が正確に保持
    expect(result.distribution.customerId).toBe(customerId);
    expect(result.distribution.customerName).toBe(customerName);
    expect(result.distribution.customerEmail).toBe(customerEmail);

    // 検証: 請求書の金額・期限が正確
    expect(result.invoiceDetails.amount).toBe(invoiceAmount);
    expect(result.invoiceDetails.dueDate).toBe(invoiceDueDate);
    expect(result.invoiceDetails.issueDate).toBe(invoiceIssueDate);

    // 検証: 配信は承認後5分以内に完了
    const distributedAtTime = new Date(result.distribution.distributedAt).getTime();
    const approvedAtTime = new Date(result.approvedAt).getTime();
    const distributionDelayMs = distributedAtTime - approvedAtTime;
    const fiveMinutesMs = 5 * 60 * 1000;
    expect(distributionDelayMs).toBeLessThanOrEqual(fiveMinutesMs);
    expect(distributionDelayMs).toBeGreaterThanOrEqual(0);

    // 検証: PDFダウンロードが可能（URLが生成される）
    expect(result.distribution.downloadUrl).toMatch(/\.com\/invoices\//);
    expect(result.distribution.documentUrl).toBeDefined();

    // 検証: 請求書明細が統一フォーマットで保持
    expect(result.invoiceDetails.lineItems).toHaveLength(1);
    expect(result.invoiceDetails.lineItems[0].description).toBe('サービス提供');
    expect(result.invoiceDetails.lineItems[0].quantity).toBe(1);
    expect(result.invoiceDetails.lineItems[0].unitPrice).toBe(150000);
    expect(result.invoiceDetails.lineItems[0].lineTotal).toBe(150000);

    // 検証: API呼び出し回数確認（承認1回、配信1回）
    expect(fetchMock.mock.calls).toHaveLength(2);

    // 検証: 承認API呼び出しの詳細
    const approvalCall = fetchMock.mock.calls[0];
    expect(approvalCall[0]).toMatch(/\/invoices\/.*\/approve/);
    expect(approvalCall[1].method).toBe('POST');

    // 検証: 配信API呼び出しの詳細
    const distributionCall = fetchMock.mock.calls[1];
    expect(distributionCall[0]).toMatch(/\/distribution\/.*\/dispatch/);
    expect(distributionCall[1].method).toBe('POST');
  });
});