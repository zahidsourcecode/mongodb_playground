# MongoPlayground

An interactive **MongoDB query playground** that runs entirely in your browser. Practice MongoDB CRUD operations, query operators, and aggregation — **no install, no login, no database server required**.

---

## Purpose

MongoPlayground is a **portfolio learning tool** for developers who want to experiment with MongoDB syntax without setting up a local MongoDB instance or cloud cluster.

### What it does

- **Simulates MongoDB** in an in-memory JavaScript engine — queries run client-side, not on a real server
- **Ships with 100 predefined JSON documents** across sample collections (`users`, `products`, `orders`) so you can practice immediately
- **Browse MongoDB methods** from a categorized reference panel (find, operators, aggregation, etc.) and insert example queries with one click
- **Add your own data** via JSON paste — extend the sandbox without any backend
- **Reset anytime** to restore the original 100 seed documents
- **Light & dark mode** with a custom theme (`#4EBDD3`)

### Who it's for

- Developers learning MongoDB query syntax
- Students practicing CRUD, filters, and operators
- Anyone who wants a quick, zero-setup MongoDB sandbox

### What it is NOT

- Not a real MongoDB server — data lives in browser memory only
- No authentication — open access for all visitors
- No persistent storage — refreshing the page reloads seed data

---

## Technology Used

| Category | Technology |
|----------|------------|
| **Framework** | React 19.2.7 |
| **Build Tool** | Vite 8 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Code Editor** | Monaco Editor |
| **Icons** | Lucide React |
| **Data Storage** | JSON files (seed data) + in-memory JavaScript store |
| **Deployment** | Vercel (static hosting) |

### Architecture

```
React UI  →  In-Memory DB Engine  →  JSON Seed Files (public/data/)
```

- No backend API
- No MongoDB server
- No database connection strings

---

## Features

- MongoDB shell-style query editor (Monaco)
- CRUD: `insertOne`, `insertMany`, `find`, `findOne`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`
- Query operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$and`, `$or`, `$nor`, `$not`
- Field operators: `$regex`, `$exists`, `$type`, `$all`, `$elemMatch`, `$size`
- Update operators: `$set`, `$unset`, `$inc`
- Pagination: `sort`, `limit`, `skip`
- Aggregation: `$match`, `$project`, `$group`, `$lookup`, `$unwind`, `$sort`, `$limit`, `$sample`, `$facet`, `$replaceRoot`
- Categorized method reference panel with 40+ commands
- 100 predefined sample documents
- Add custom documents via UI or `insertOne` in the editor
- Collection sidebar with live document counts
- JSON syntax-highlighted results panel
- Light / dark mode toggle
- One-click reset to seed data

---

## Getting Started

### Prerequisites

- **Node.js** 20.19+ or 22.12+
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mongodb_crud.git
   cd mongodb_crud
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Visit [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
npm run build
```

Output is in the `dist/` folder — ready for Vercel or any static host.

### Preview production build locally

```bash
npm run preview
```

### Regenerate seed data

```bash
npm run generate-seed
```

---

## Usage

1. Open the app — sample data loads automatically (100 documents).
2. Pick a collection from the sidebar (`users`, `products`, `orders`).
3. Click a method from the **MongoDB Methods** panel (e.g. `find`, `$gt`) to fill the editor with an example.
4. Click **Run** or press `Ctrl+Enter`.
5. View results in the panel below the editor.
6. Use **+ Add** to insert your own documents.
7. Use **Reset** to restore the original seed data.

### Example queries

```javascript
// Find all users
db.users.find()

// Filter by age
db.users.find({ age: { $gt: 25 } })

// Insert a document
db.users.insertOne({ name: "Zahid", age: 25, role: "developer" })

// Update a document
db.users.updateOne({ name: "User 1" }, { $set: { age: 26 } })

// Delete a document
db.users.deleteOne({ name: "User 1" })

// Sort and limit
db.users.find().sort({ age: -1 }).limit(5)

// Aggregation
db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
```

---

## Project Structure

```
mongodb_crud/
├── public/
│   └── data/              # JSON seed files (100 predefined documents)
│       ├── users.json
│       ├── products.json
│       └── orders.json
├── scripts/
│   └── generate-seed-data.mjs
├── src/
│   ├── components/        # React UI components
│   ├── engine/            # In-memory MongoDB simulator
│   ├── data/              # Method reference data
│   ├── hooks/             # Custom React hooks (theme, database)
│   └── index.css          # Global CSS + theme variables
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Vercel detects Vite automatically:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy — you get a URL like `https://mongodb-playground.vercel.app`.

No environment variables or database setup required.

---

## License

MIT
