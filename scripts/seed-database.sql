-- Create initial admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (id, email, name, password, role, apartment, phone, created_at, updated_at)
VALUES (
  'admin-user-id',
  'admin@building.com',
  'System Administrator',
  '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdh7QzGNWqeqY5FC2sFSLOHxEo9TlUnm',
  'ADMIN',
  'Admin Office',
  '+1234567890',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create sample manager user
-- Password: manager123 (hashed with bcrypt)
INSERT INTO users (id, email, name, password, role, apartment, phone, created_at, updated_at)
VALUES (
  'manager-user-id',
  'manager@building.com',
  'Building Manager',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'MANAGER',
  '1A',
  '+1234567891',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create sample regular users
INSERT INTO users (id, email, name, password, role, apartment, phone, created_at, updated_at)
VALUES 
  ('user-1-id', 'john@example.com', 'John Doe', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', '2B', '+1234567892', NOW(), NOW()),
  ('user-2-id', 'jane@example.com', 'Jane Smith', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', '3C', '+1234567893', NOW(), NOW()),
  ('user-3-id', 'bob@example.com', 'Bob Johnson', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', '4D', '+1234567894', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create sample monthly fees
INSERT INTO monthly_fees (id, user_id, amount, month, year, is_paid, due_date, description, created_at, updated_at)
VALUES 
  ('fee-1', 'user-1-id', 150.00, 12, 2024, true, '2024-12-01', 'Monthly building maintenance fee', NOW(), NOW()),
  ('fee-2', 'user-2-id', 150.00, 12, 2024, false, '2024-12-01', 'Monthly building maintenance fee', NOW(), NOW()),
  ('fee-3', 'user-3-id', 150.00, 12, 2024, true, '2024-12-01', 'Monthly building maintenance fee', NOW(), NOW()),
  ('fee-4', 'user-1-id', 150.00, 1, 2025, false, '2025-01-01', 'Monthly building maintenance fee', NOW(), NOW()),
  ('fee-5', 'user-2-id', 150.00, 1, 2025, false, '2025-01-01', 'Monthly building maintenance fee', NOW(), NOW()),
  ('fee-6', 'user-3-id', 150.00, 1, 2025, false, '2025-01-01', 'Monthly building maintenance fee', NOW(), NOW())
ON CONFLICT (user_id, month, year) DO NOTHING;

-- Create sample donations
INSERT INTO donations (id, user_id, amount, description, is_visible, created_at, updated_at)
VALUES 
  ('donation-1', 'user-1-id', 100.00, 'For elevator repair fund', true, NOW(), NOW()),
  ('donation-2', 'user-2-id', 50.00, 'Garden maintenance', false, NOW(), NOW()),
  ('donation-3', 'user-3-id', 200.00, 'Building security upgrade', true, NOW(), NOW()),
  ('donation-4', 'user-1-id', 75.00, 'Holiday decorations', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create sample expenses
INSERT INTO expenses (id, title, description, amount, type, status, due_date, created_by_id, created_at, updated_at)
VALUES 
  ('expense-1', 'Building Maid Salary', 'Monthly salary for building cleaning staff', 800.00, 'MONTHLY', 'APPROVED', '2024-12-31', 'manager-user-id', NOW(), NOW()),
  ('expense-2', 'Elevator Repair', 'Fix elevator motor and cables', 2500.00, 'OCCASIONAL', 'PENDING', '2024-12-20', 'manager-user-id', NOW(), NOW()),
  ('expense-3', 'Garden Maintenance', 'Monthly garden care and landscaping', 300.00, 'MONTHLY', 'COMPLETED', '2024-12-15', 'manager-user-id', NOW(), NOW()),
  ('expense-4', 'Security Camera Installation', 'Install new security cameras in lobby', 1200.00, 'OCCASIONAL', 'APPROVED', '2024-12-25', 'manager-user-id', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create system health record
INSERT INTO system_health (id, total_users, total_revenue, total_expenses, pending_expenses, system_uptime, last_backup, created_at)
VALUES (
  'health-1',
  (SELECT COUNT(*) FROM users),
  (SELECT COALESCE(SUM(amount), 0) FROM monthly_fees WHERE is_paid = true) + (SELECT COALESCE(SUM(amount), 0) FROM donations),
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE status IN ('APPROVED', 'COMPLETED')),
  (SELECT COUNT(*) FROM expenses WHERE status = 'PENDING'),
  99.9,
  NOW() - INTERVAL '1 day',
  NOW()
) ON CONFLICT DO NOTHING;
