📦E-Commerce Backend
A production-ready e-commerce backend built with Node.js, TypeScript, Express, and Prisma ORM, designed to handle scalable product, user, cart, and order management.

🚀 Features:

🔑 Authentication & Authorization (JWT-based login & role management)

🛒 Product Management (CRUD APIs for products, categories, inventory)

📦 Cart & Orders (add to cart, checkout, order processing)

💳 Payment Integration Ready (modular structure for future payment gateways)

📊 Database with Prisma (PostgreSQL/MySQL supported, migrations included)

🛡️ Error Handling & Validation (centralized error middleware, request validation)

⚡ Scalable API Design (RESTful endpoints, modular service layer)

🛠 Tech Stack
Backend: Node.js, Express, TypeScript
Database: PostgreSQL (via Prisma ORM)
Authentication: JWT (JSON Web Tokens)
Validation: Zod 


# Clone repository
git clone https://github.com/kartikeytyagi09/ecom-backend.git
cd ecom-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# update DB connection string & JWT_SECRET inside .env

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
