jest.mock("../../src/repositories/book.repository", () => ({
  findByIsbn: jest.fn(),
  updateById: jest.fn(),
}));

jest.mock("../../src/repositories/borrowing.repository", () => ({
  hasActiveByBookId: jest.fn(),
}));

const bookRepo = require("../../src/repositories/book.repository");
const BookService = require("../../src/services/book.service");
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require("../../src/utils/errors");

describe("BookService.updateBook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("throws BadRequestError for invalid id", async () => {
    await expect(BookService.updateBook("abc", {}))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws BadRequestError when title is empty", async () => {
    await expect(BookService.updateBook(1, { title: "   " }))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws BadRequestError when author is empty", async () => {
    await expect(BookService.updateBook(1, { author: "" }))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws BadRequestError when isbn is empty", async () => {
    await expect(BookService.updateBook(1, { isbn: " " }))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws ConflictError if isbn already exists for another book", async () => {
    bookRepo.findByIsbn.mockResolvedValue({ id: 2 });

    await expect(BookService.updateBook(1, { isbn: "123" }))
      .rejects.toBeInstanceOf(ConflictError);
  });

  test("throws BadRequestError for negative quantity", async () => {
    await expect(BookService.updateBook(1, { available_quantity: -1 }))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws BadRequestError for non-integer quantity", async () => {
    await expect(BookService.updateBook(1, { available_quantity: "abc" }))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws NotFoundError when book not found", async () => {
    bookRepo.findByIsbn.mockResolvedValue(null);
    bookRepo.updateById.mockResolvedValue(null);

    await expect(BookService.updateBook(1, { title: "Clean Code" }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  test("updates book successfully", async () => {
    bookRepo.findByIsbn.mockResolvedValue(null);
    bookRepo.updateById.mockResolvedValue({ id: 1, title: "Updated" });

    const result = await BookService.updateBook(1, {
      isbn: " 123 ",
      available_quantity: "5",
    });

    expect(bookRepo.findByIsbn).toHaveBeenCalledWith("123");
    expect(bookRepo.updateById).toHaveBeenCalledWith(1, {
      isbn: "123",
      available_quantity: 5,
    });
    expect(result).toEqual({ id: 1, title: "Updated" });
  });
});
