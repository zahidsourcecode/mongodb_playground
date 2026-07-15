export interface CommandItem {
  name: string;
  example: string;
  description: string;
}

export interface MethodCategory {
  category: string;
  commands: CommandItem[];
}

export const mongoMethods: MethodCategory[] = [
  {
    category: 'Search',
    commands: [
      { name: 'find', example: 'db.users.find({})', description: 'Find all documents in a collection' },
      { name: 'findOne', example: 'db.users.findOne({ name: "User 1" })', description: 'Find a single document' },
    ],
  },
  {
    category: 'Comparison',
    commands: [
      { name: '$eq', example: 'db.users.find({ age: { $eq: 25 } })', description: 'Equal to' },
      { name: '$ne', example: 'db.users.find({ age: { $ne: 25 } })', description: 'Not equal to' },
      { name: '$gt', example: 'db.users.find({ age: { $gt: 30 } })', description: 'Greater than' },
      { name: '$gte', example: 'db.users.find({ age: { $gte: 25 } })', description: 'Greater than or equal' },
      { name: '$lt', example: 'db.users.find({ age: { $lt: 25 } })', description: 'Less than' },
      { name: '$lte', example: 'db.users.find({ age: { $lte: 25 } })', description: 'Less than or equal' },
    ],
  },
  {
    category: 'Logical',
    commands: [
      { name: '$and', example: 'db.users.find({ $and: [{ age: { $gt: 20 } }, { role: "developer" }] })', description: 'Logical AND' },
      { name: '$or', example: 'db.users.find({ $or: [{ age: { $lt: 22 } }, { role: "manager" }] })', description: 'Logical OR' },
      { name: '$nor', example: 'db.users.find({ $nor: [{ age: { $lt: 18 } }, { active: false }] })', description: 'Logical NOR' },
      { name: '$not', example: 'db.users.find({ age: { $not: { $gt: 40 } } })', description: 'Logical NOT' },
    ],
  },
  {
    category: 'Array',
    commands: [
      { name: '$in', example: 'db.users.find({ role: { $in: ["developer", "designer"] } })', description: 'Value in array' },
      { name: '$nin', example: 'db.users.find({ role: { $nin: ["manager"] } })', description: 'Value not in array' },
      { name: '$all', example: 'db.users.find({ tags: { $all: ["tag1", "skill1"] } })', description: 'Array contains all' },
      { name: '$elemMatch', example: 'db.users.find({ scores: { $elemMatch: { $gt: 80 } } })', description: 'Element match' },
      { name: '$size', example: 'db.users.find({ tags: { $size: 2 } })', description: 'Array size' },
    ],
  },
  {
    category: 'Field',
    commands: [
      { name: '$regex', example: 'db.users.find({ name: { $regex: /^User/ } })', description: 'Regular expression' },
      { name: '$exists', example: 'db.users.find({ email: { $exists: true } })', description: 'Field exists' },
      { name: '$type', example: 'db.users.find({ age: { $type: "number" } })', description: 'Field type check' },
    ],
  },
  {
    category: 'Pagination',
    commands: [
      { name: 'sort', example: 'db.users.find().sort({ age: -1 })', description: 'Sort results' },
      { name: 'limit', example: 'db.users.find().limit(5)', description: 'Limit results' },
      { name: 'skip', example: 'db.users.find().skip(2).limit(5)', description: 'Skip results' },
    ],
  },
  {
    category: 'Write',
    commands: [
      { name: 'insertOne', example: 'db.users.insertOne({ name: "Zahid", age: 25, role: "developer" })', description: 'Insert one document' },
      { name: 'insertMany', example: 'db.users.insertMany([{ name: "Alice" }, { name: "Bob" }])', description: 'Insert multiple documents' },
      { name: 'updateOne', example: 'db.users.updateOne({ name: "User 1" }, { $set: { age: 26 } })', description: 'Update one document' },
      { name: 'updateMany', example: 'db.users.updateMany({ active: false }, { $set: { active: true } })', description: 'Update many documents' },
      { name: 'deleteOne', example: 'db.users.deleteOne({ name: "User 1" })', description: 'Delete one document' },
      { name: 'deleteMany', example: 'db.users.deleteMany({ active: false })', description: 'Delete many documents' },
    ],
  },
  {
    category: 'Aggregation',
    commands: [
      { name: '$match', example: 'db.orders.aggregate([{ $match: { status: "completed" } }])', description: 'Filter documents' },
      { name: '$project', example: 'db.users.aggregate([{ $project: { name: 1, age: 1 } }])', description: 'Shape output fields' },
      { name: '$group', example: 'db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])', description: 'Group documents' },
      { name: '$lookup', example: 'db.orders.aggregate([{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }])', description: 'Join collections' },
      { name: '$unwind', example: 'db.orders.aggregate([{ $unwind: "$items" }])', description: 'Unwind arrays' },
    ],
  },
  {
    category: 'Calculation',
    commands: [
      { name: '$sum', example: 'db.orders.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])', description: 'Sum values' },
      { name: '$avg', example: 'db.products.aggregate([{ $group: { _id: "$category", avgPrice: { $avg: "$price" } } }])', description: 'Average values' },
      { name: '$min', example: 'db.products.aggregate([{ $group: { _id: null, minPrice: { $min: "$price" } } }])', description: 'Minimum value' },
      { name: '$max', example: 'db.products.aggregate([{ $group: { _id: null, maxPrice: { $max: "$price" } } }])', description: 'Maximum value' },
    ],
  },
  {
    category: 'Advanced',
    commands: [
      { name: '$facet', example: 'db.users.aggregate([{ $facet: { adults: [{ $match: { age: { $gte: 18 } } }], young: [{ $match: { age: { $lt: 25 } } }] } }])', description: 'Multiple pipelines' },
      { name: '$expr', example: 'db.users.find({ $expr: { $gt: ["$age", 30] } })', description: 'Aggregation expressions in find' },
      { name: '$sample', example: 'db.users.aggregate([{ $sample: { size: 3 } }])', description: 'Random sample' },
      { name: '$replaceRoot', example: 'db.users.aggregate([{ $replaceRoot: { newRoot: { fullName: "$name", years: "$age" } } }])', description: 'Replace root document' },
    ],
  },
];

export const defaultQuery = 'db.users.find({ age: { $gt: 25 } })';
