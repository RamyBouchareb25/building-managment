# Building Funds Manager

A comprehensive web application for managing building funds and resources with role-based access control (RBAC).

## Features

### 🔐 Authentication & Authorization
- **Sign up, Sign in, Forgot password** functionality
- **Role-based access control** (Admin, Manager, User)
- **Secure password hashing** with bcrypt
- **Session management** with NextAuth.js

### 👥 User Roles & Permissions
- **User**: Read-only access to view fees, donations, and expenses
- **Manager**: Full CRUD operations + dashboard with statistics and charts
- **Admin**: Manager permissions + system health dashboard + developer settings

### 💰 Core Features
- **Monthly Fees Management**: Track monthly contributions from residents
- **Donations System**: Handle extra donations with privacy options (anonymous donations)
- **Expense Tracking**: Manage both monthly (maid salary) and occasional (elevator repair) expenses
- **Dashboard Analytics**: Role-specific dashboards with statistics and charts

### 🎨 Design & UX
- **Responsive Design**: Beautiful, mobile-friendly interface using Tailwind CSS and shadcn/ui
- **Dark/Light Mode**: Theme switching capability
- **Modern UI**: Clean, professional design
- **Interactive Charts**: Financial analytics using Recharts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd building-funds-manager
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update the `.env` file with your database URL and other configuration:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/building_funds_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   npm run db:push
   \`\`\`

5. **Seed the database** (optional)
   Execute the SQL script in `scripts/seed-database.sql` to create sample data with default users:
   - Admin: `admin@building.com` / `admin123`
   - Manager: `manager@building.com` / `manager123`
   - User: `john@example.com` / `user123`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to `http://localhost:3000`

## Database Schema

The application uses the following main entities:

- **Users**: Residents with roles (Admin, Manager, User)
- **MonthlyFees**: Monthly contributions tracking
- **Donations**: Extra contributions with visibility options
- **Expenses**: Building maintenance and operational costs
- **SystemHealth**: System monitoring data

## API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset

### Donations
- `GET /api/donations` - Get donations (role-based filtering)
- `POST /api/donations` - Create new donation

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard pages
│   ├── manager/           # Manager-specific pages
│   ├── admin/             # Admin-specific pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
├── prisma/               # Database schema and migrations
└── scripts/              # Database seed scripts
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Features by Role

### 👤 User (Resident)
- View personal monthly fee status
- View personal donation history
- Make new donations (with privacy options)
- View building expenses (read-only)
- Personal dashboard with payment status

### 👨‍💼 Manager
- All User permissions
- Manage all monthly fees (CRUD)
- View all donations (respecting privacy settings)
- Manage expenses (CRUD)
- Manage users
- Manager dashboard with analytics and charts
- Financial reporting

### 🔧 Admin
- All Manager permissions
- System health monitoring
- Developer settings and tools
- User role management
- System logs and maintenance
- Database backup and restore
- Security monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
