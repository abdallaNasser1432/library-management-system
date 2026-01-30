const borrowerRepo = require("../repositories/borrower.repository");
const { BadRequestError, ConflictError, NotFoundError } = require("../utils/errors");

class BorrowerService {
  async createBorrower(payload) {
    if (!payload.name || !payload.email) {
      throw new BadRequestError("Missing required fields");
    }

    const existing = await borrowerRepo.findByEmail(payload.email);
    if (existing) throw new ConflictError("Email already exists");

    return borrowerRepo.create(payload);
  }

  async getBorrowerById(id) {
    const borrower = await borrowerRepo.findById(id);
    if (!borrower) throw new NotFoundError("Borrower not found");
    return borrower;
  }

  async listBorrowers(params) {
    return borrowerRepo.list(params);
  }

  async updateBorrower(id, payload) {
    if (payload.email) {
      const existing = await borrowerRepo.findByEmail(payload.email);
      if (existing && existing.id !== Number(id)) {
        throw new ConflictError("Email already exists");
      }
    }

    const updated = await borrowerRepo.updateById(id, payload);
    if (!updated) throw new NotFoundError("Borrower not found");
    return updated;
  }

  async deleteBorrower(id) {
    const ok = await borrowerRepo.deleteById(id);
    if (!ok) throw new NotFoundError("Borrower not found");
    return true;
  }
}

module.exports = new BorrowerService();
