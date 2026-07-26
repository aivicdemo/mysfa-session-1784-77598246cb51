import { escapeSpecialCharactersForDocumentFormat } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 帳票データ抽出・反映機能", () => {
  // SCEN-079
  test("商談に特殊文字が含まれている場合、帳票のフォーマットに従って正しくエスケープされる", () => {
    const dealWithSpecialChars = {
      dealId: "DEAL-001",
      dealName: "Deal with <special> & \"quoted\" 'chars'",
      customerName: "Customer & Co. <Ltd>",
      comments: "Review the <agreement> & terms. Price: $1000 & discount 10%",
      amount: 100000,
      status: "受注",
      dueDate: "2024-12-31",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealWithSpecialChars,
      "HTML"
    );

    expect(result.dealName).toBe(
      "Deal with &lt;special&gt; &amp; &quot;quoted&quot; &#x27;chars&#x27;"
    );
    expect(result.customerName).toBe("Customer &amp; Co. &lt;Ltd&gt;");
    expect(result.comments).toBe(
      "Review the &lt;agreement&gt; &amp; terms. Price: $1000 &amp; discount 10%"
    );
    expect(result.amount).toBe(100000);
    expect(result.status).toBe("受注");
    expect(result.dueDate).toBe("2024-12-31");
  });

  test("XML形式での特殊文字エスケープが正しく機能する", () => {
    const dealData = {
      dealId: "DEAL-002",
      dealName: "Contract <2024> & Review",
      customerName: "Tech & Innovation \"Ltd\"",
      comments: "Items: <item1> & <item2> with 'specifications'",
      amount: 250000,
      status: "商談中",
      dueDate: "2024-06-30",
    };

    const result = escapeSpecialCharactersForDocumentFormat(dealData, "XML");

    expect(result.dealName).toBe("Contract &lt;2024&gt; &amp; Review");
    expect(result.customerName).toBe(
      "Tech &amp; Innovation &quot;Ltd&quot;"
    );
    expect(result.comments).toBe(
      "Items: &lt;item1&gt; &amp; &lt;item2&gt; with &#x27;specifications&#x27;"
    );
  });

  test("CSV形式での特殊文字エスケープが正しく機能する", () => {
    const dealData = {
      dealId: "DEAL-003",
      dealName: 'Product "XYZ" & Service <Premium>',
      customerName: "Global & Partners, Inc.",
      comments: 'Description: "High-end" & <customizable>',
      amount: 500000,
      status: "完了",
      dueDate: "2024-03-15",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealData,
      "CSV"
    );

    expect(result.dealName).toBe('Product ""XYZ"" & Service <Premium>');
    expect(result.customerName).toBe("Global & Partners, Inc.");
    expect(result.comments).toBe(
      'Description: ""High-end"" & <customizable>'
    );
  });

  test("バックスラッシュを含む特殊文字が正しくエスケープされる", () => {
    const dealData = {
      dealId: "DEAL-004",
      dealName: "Path: C:\\Documents\\Deals\\2024",
      customerName: "Windows \\ Network",
      comments: "File: \\\\server\\share\\document.txt",
      amount: 150000,
      status: "受注",
      dueDate: "2024-07-20",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealData,
      "HTML"
    );

    expect(result.dealName).toBe(
      "Path: C:\\\\Documents\\\\Deals\\\\2024"
    );
    expect(result.customerName).toBe("Windows \\\\ Network");
    expect(result.comments).toBe(
      "File: \\\\\\\\server\\\\share\\\\document.txt"
    );
  });

  test("複合的な特殊文字が混在する場合、すべてが正しくエスケープされる", () => {
    const dealData = {
      dealId: "DEAL-005",
      dealName: "Deal: \"Quote\" <Tag> & Symbol's Path\\File",
      customerName: "Company & \"Partners\" <Global>",
      comments:
        "Notes: Check <requirements> & \"specifications\" with path C:\\Data\\2024",
      amount: 75000,
      status: "商談中",
      dueDate: "2024-09-10",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealData,
      "HTML"
    );

    expect(result.dealName).toBe(
      "Deal: &quot;Quote&quot; &lt;Tag&gt; &amp; Symbol&#x27;s Path\\File"
    );
    expect(result.customerName).toBe(
      "Company &amp; &quot;Partners&quot; &lt;Global&gt;"
    );
    expect(result.comments).toBe(
      "Notes: Check &lt;requirements&gt; &amp; &quot;specifications&quot; with path C:\\Data\\2024"
    );
  });

  test("空文字列を含むデータでもエスケープ処理が正常に機能する", () => {
    const dealData = {
      dealId: "DEAL-006",
      dealName: "",
      customerName: "Standard Customer",
      comments: "No special chars here",
      amount: 0,
      status: "未開始",
      dueDate: "",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealData,
      "HTML"
    );

    expect(result.dealName).toBe("");
    expect(result.customerName).toBe("Standard Customer");
    expect(result.comments).toBe("No special chars here");
    expect(result.amount).toBe(0);
  });

  test("エスケープ後のデータが帳票ファイル構造を破損しない", () => {
    const dealData = {
      dealId: "DEAL-007",
      dealName: "Project <Alpha> & <Beta>",
      customerName: "Client & Associates \"2024\"",
      comments: "Requirement: <must-have> & optional items with discount",
      amount: 320000,
      status: "受注",
      dueDate: "2024-08-25",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealData,
      "HTML"
    );

    const htmlContent = `
      <deal>
        <dealId>${result.dealId}</dealId>
        <dealName>${result.dealName}</dealName>
        <customerName>${result.customerName}</customerName>
        <comments>${result.comments}</comments>
        <amount>${result.amount}</amount>
        <status>${result.status}</status>
        <dueDate>${result.dueDate}</dueDate>
      </deal>
    `;

    expect(htmlContent).toContain("&lt;Alpha&gt;");
    expect(htmlContent).toContain("&amp;");
    expect(htmlContent).toContain("&quot;");
    expect(htmlContent).not.toContain("<dealName>Project <Alpha>");
  });

  test("エスケープされた文字列が元の意味を保持している", () => {
    const dealData = {
      dealId: "DEAL-008",
      dealName: "Proposal: A&B < C&D",
      customerName: "Firm & Partners",
      comments: "Evaluate 'option1' & 'option2'",
      amount: 180000,
      status: "検討中",
      dueDate: "2024-10-15",
    };

    const result = escapeSpecialCharactersForDocumentFormat(
      dealData,
      "HTML"
    );

    expect(result.dealName).toBe(
      "Proposal: A&amp;B &lt; C&amp;D"
    );
    expect(result.customerName).toBe("Firm &amp; Partners");
    expect(result.comments).toBe(
      "Evaluate &#x27;option1&#x27; &amp; &#x27;option2&#x27;"
    );

    expect(result.amount).toBe(180000);
    expect(result.status).toBe("検討中");
  });
});