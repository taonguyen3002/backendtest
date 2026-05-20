/**
 * Base Repository - Abstract class for common operations
 * Mọi repository có thể extend từ class này
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // ✅ Find by ID
  async findById(id) {
    return await this.model.findById(id);
  }

  // ✅ Find one by query
  async findOne(query) {
    return await this.model.findOne(query);
  }

  // ✅ Find many with pagination
  async find(query = {}, skip = 0, limit = 10) {
    return await this.model.find(query).skip(skip).limit(limit);
  }

  // ✅ Count documents
  async count(query = {}) {
    return await this.model.countDocuments(query);
  }

  // ✅ Find and count
  async findAndCount(query = {}, skip = 0, limit = 10) {
    const [items, total] = await Promise.all([this.find(query, skip, limit), this.count(query)]);
    return { items, total };
  }

  // ✅ Create
  async create(data) {
    const doc = new this.model(data);
    return await doc.save();
  }

  // ✅ Update by ID
  async findByIdAndUpdate(id, data, options = { new: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  // ✅ Delete by ID
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  // ✅ Update many
  async updateMany(query, data) {
    return await this.model.updateMany(query, data);
  }

  // ✅ Delete many
  async deleteMany(query) {
    return await this.model.deleteMany(query);
  }

  // ✅ Bulk operations
  async bulkWrite(operations) {
    return await this.model.bulkWrite(operations);
  }

  // ✅ Aggregate
  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }

  // ✅ Distinct
  async distinct(field, query = {}) {
    return await this.model.distinct(field, query);
  }

  // ✅ Exists
  async exists(query) {
    return await this.model.exists(query);
  }
}

export default BaseRepository;
