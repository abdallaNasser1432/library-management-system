const ExcelJS = require("exceljs");

const toCsv = (rows) => {
  const headers = [
    "borrowing_id",
    "borrowed_at",
    "due_date",
    "returned_at",
    "book_id",
    "book_title",
    "book_author",
    "book_isbn",
    "borrower_id",
    "borrower_name",
    "borrower_email",
  ];

  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => escape(r[h]))
        .join(",")
    ),
  ];

  return lines.join("\n");
};

const toXlsxBuffer = async (rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Borrowings");

  sheet.columns = [
    { header: "Borrowing ID", key: "borrowing_id", width: 14 },
    { header: "Borrowed At", key: "borrowed_at", width: 22 },
    { header: "Due Date", key: "due_date", width: 22 },
    { header: "Returned At", key: "returned_at", width: 22 },
    { header: "Book ID", key: "book_id", width: 10 },
    { header: "Title", key: "book_title", width: 28 },
    { header: "Author", key: "book_author", width: 22 },
    { header: "ISBN", key: "book_isbn", width: 18 },
    { header: "Borrower ID", key: "borrower_id", width: 12 },
    { header: "Borrower Name", key: "borrower_name", width: 22 },
    { header: "Borrower Email", key: "borrower_email", width: 26 },
  ];

  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  toCsv,
  toXlsxBuffer,
};
