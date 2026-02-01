jest.mock("../../src/repositories/book.repository", () => ({
  findByIsbn: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
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


describe("BookService.deleteBook", () => {
  const borrowingRepo = require("../../src/repositories/borrowing.repository");
  const bookRepo = require("../../src/repositories/book.repository");
  const { BadRequestError, NotFoundError } = require("../../src/utils/errors");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("throws BadRequestError if book has active borrowings", async () => {
    borrowingRepo.hasActiveByBookId.mockResolvedValue(true);

    await expect(BookService.deleteBook(1))
      .rejects.toBeInstanceOf(BadRequestError);
  });

  test("throws NotFoundError if book does not exist", async () => {
    borrowingRepo.hasActiveByBookId.mockResolvedValue(false);
    bookRepo.deleteById.mockResolvedValue(null);

    await expect(BookService.deleteBook(999))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  test("deletes book successfully", async () => {
    borrowingRepo.hasActiveByBookId.mockResolvedValue(false);
    bookRepo.deleteById.mockResolvedValue(true);

    const result = await BookService.deleteBook(1);

    expect(borrowingRepo.hasActiveByBookId).toHaveBeenCalledWith(1);
    expect(bookRepo.deleteById).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });
  
});
