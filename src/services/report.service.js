const borrowingRepo = require("../repositories/borrowing.repository");
const { BadRequestError } = require("../utils/errors");
const { toCsv, toXlsxBuffer } = require("../utils/Export");

const isValidDate = (value) => {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const toISOString = (value) => new Date(value).toISOString();

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
