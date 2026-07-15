import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');
mkdirSync(dataDir, { recursive: true });

const roles = ['developer', 'designer', 'manager', 'analyst', 'engineer'];
const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal'];
const categories = ['electronics', 'furniture', 'clothing', 'books', 'sports'];
const statuses = ['pending', 'completed', 'cancelled', 'shipped'];

const users = Array.from({ length: 40 }, (_, i) => ({
  _id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  age: 18 + (i % 45),
  role: roles[i % roles.length],
  city: cities[i % cities.length],
  active: i % 4 !== 0,
  tags: [`tag${(i % 3) + 1}`, `skill${(i % 5) + 1}`],
  scores: [60 + (i % 40), 70 + (i % 30)],
  createdAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
}));

const products = Array.from({ length: 35 }, (_, i) => ({
  _id: String(i + 1),
  title: `Product ${i + 1}`,
  price: 10 + (i * 27) % 990,
  category: categories[i % categories.length],
  stock: 5 + (i * 13) % 200,
  rating: 1 + (i % 5),
  featured: i % 5 === 0,
  tags: [categories[i % categories.length], `brand${(i % 4) + 1}`],
}));

const orders = Array.from({ length: 25 }, (_, i) => ({
  _id: String(i + 1),
  userId: String((i % 40) + 1),
  productId: String((i % 35) + 1),
  quantity: 1 + (i % 5),
  status: statuses[i % statuses.length],
  amount: 10 + (i * 37) % 500,
  items: [
    { productId: String((i % 35) + 1), qty: 1 + (i % 3) },
    { productId: String(((i + 5) % 35) + 1), qty: 1 },
  ],
  createdAt: new Date(2024, (i + 3) % 12, (i % 28) + 1).toISOString(),
}));

writeFileSync(join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
writeFileSync(join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
writeFileSync(join(dataDir, 'orders.json'), JSON.stringify(orders, null, 2));

console.log(`Generated ${users.length + products.length + orders.length} documents.`);
