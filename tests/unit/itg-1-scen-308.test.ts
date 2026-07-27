import {
  linkDealWithInvoice,
  detectDiscrepancy,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-308
  test("商談レコードに見積金額が不在のとき、紐付けは実行されるが金額ズレ検出がスキップされる", () => {
    const dealData = {
      deal_id: "DEAL-308",
      customer_name: "TestCorp",
      status: "提案中",
      estimated_amount: null,
      invoice_id: null,
    };

    const invoiceData = {
      invoice_id: "INV-308",
      deal_id: null,
      invoice_amount: 500000,
    };

    const systemLogs: Array<{ level: string; message: string }> = [];
    const mockLogger = {
      info: (message: string) => {
        systemLogs.push({ level: "INFO", message });
      },
      warn: (message: string) => {
        systemLogs.push({ level: "WARN", message });
      },
      error: (message: string) => {
        systemLogs.push({ level: "ERROR", message });
      },
    };

    const discrepancyDetectionCalls: Array<{
      dealId: string;
      estimatedAmount: number | null;
      invoiceAmount: number;
    }> = [];

    const mockDiscrepancyDetector = {
      detectDiscrepancy: (
        dealId: string,
        estimatedAmount: number | null,
        invoiceAmount: number
      ) => {
        discrepancyDetectionCalls.push({
          dealId,
          estimatedAmount,
          invoiceAmount,
        });
        return {
          has_discrepancy: false,
          warning_message: null,
        };
      },
    };

    const linkageResult = linkDealWithInvoice(dealData, invoiceData, {
      logger: mockLogger,
      discrepancyDetector: mockDiscrepancyDetector,
    });

    expect(linkageResult.deal_id).toBe("DEAL-308");
    expect(linkageResult.invoice_id).toBe("INV-308");
    expect(linkageResult.linkage_status).toBe("linked");

    expect(linkageResult.linked_deal.deal_id).toBe("DEAL-308");
    expect(linkageResult.linked_deal.invoice_id).toBe("INV-308");

    expect(linkageResult.linked_invoice.invoice_id).toBe("INV-308");
    expect(linkageResult.linked_invoice.deal_id).toBe("DEAL-308");

    expect(discrepancyDetectionCalls).toHaveLength(0);

    const skipLog = systemLogs.find(
      (log) =>
        log.level === "INFO" &&
        log.message.includes("見積金額が不在のため金額ズレ検出をスキップしました")
    );
    expect(skipLog).toBeDefined();
    expect(skipLog?.message).toMatch(/見積金額が不在/);

    expect(linkageResult.amount_discrepancy_detected).toBe(false);
    expect(linkageResult.amount_discrepancy_warning).toBe(null);
  });
});