const ExcelJS = require("exceljs");
const borrowingRepo = require("../repositories/borrowing.repository");
const { BadRequestError } = require("../utils/errors");

const isValidDate = (value) => {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const toISOString = (value) => new Date(value).toISOString();

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

class ReportService {
  async borrowingsSummary({ from, to }) {
    if (!from || !to) throw new BadRequestError("from and to are required");
    if (!isValidDate(from) || !isValidDate(to)) {
      throw new BadRequestError("Invalid date format");
    }

    const fromIso = toISOString(from);
    const toIso = toISOString(to);

    const data = await borrowingRepo.listByPeriod({ from: fromIso, to: toIso });

    const total = data.length;
    const returned = data.filter((x) => x.returned_at).length;
    const active = total - returned;
    const overdue = data.filter((x) => !x.returned_at && new Date(x.due_date) < new Date()).length;

    return {
      period: { from: fromIso, to: toIso },
      metrics: { total, returned, active, overdue },
    };
  }

  async borrowingsExport({ from, to }) {
    if (!from || !to) throw new BadRequestError("from and to are required");
    if (!isValidDate(from) || !isValidDate(to)) {
      throw new BadRequestError("Invalid date format");
    }

    const fromIso = toISOString(from);
    const toIso = toISOString(to);

    const rows = await borrowingRepo.listByPeriod({ from: fromIso, to: toIso });

    return rows.map((r) => ({
      borrowing_id: r.id,
      borrowed_at: r.borrowed_at,
      due_date: r.due_date,
      returned_at: r.returned_at,
      book_id: r.book_id,
      book_title: r.book_title,
      book_author: r.book_author,
      book_isbn: r.book_isbn,
      borrower_id: r.borrower_id,
      borrower_name: r.borrower_name,
      borrower_email: r.borrower_email,
    }));
  }

  getLastMonthRange() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(firstDayThisMonth.getTime() - 1);

    return {
      from: firstDayLastMonth.toISOString(),
      to: lastDayLastMonth.toISOString(),
    };
  }

  async overdueLastMonthExport() {
    const { from, to } = this.getLastMonthRange();
    const rows = await borrowingRepo.listByDueDatePeriod({ from, to });

    return rows
      .filter((r) => !r.returned_at || new Date(r.returned_at) > new Date(r.due_date))
      .map((r) => ({
        borrowing_id: r.id,
        borrowed_at: r.borrowed_at,
        due_date: r.due_date,
        returned_at: r.returned_at,
        book_id: r.book_id,
        book_title: r.book_title,
        borrower_id: r.borrower_id,
        borrower_name: r.borrower_name,
      }));
  }

  async allBorrowingsLastMonthExport() {
    const { from, to } = this.getLastMonthRange();
    const rows = await borrowingRepo.listByPeriod({ from, to });

    return rows.map((r) => ({
      borrowing_id: r.id,
      borrowed_at: r.borrowed_at,
      due_date: r.due_date,
      returned_at: r.returned_at,
      book_id: r.book_id,
      book_title: r.book_title,
      borrower_id: r.borrower_id,
      borrower_name: r.borrower_name,
    }));
  }

  // export helpers
  toCsv(rows) {
    return toCsv(rows);
  }

  async toXlsxBuffer(rows) {
    return toXlsxBuffer(rows);
  }
}

module.exports = new ReportService();
