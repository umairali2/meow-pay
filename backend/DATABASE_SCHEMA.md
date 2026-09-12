# MeowPay Database Schema Documentation

## Overview
This document describes the database schema for MeowPay, a digital wallet system for cats to transfer treats.

## Tables

### cats
Stores information about cat accounts and their treat balances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each cat |
| name | TEXT | NOT NULL, UNIQUE | Cat's name (must be unique) |
| balance | INTEGER | NOT NULL, DEFAULT 0 | Current treat balance |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp (auto-updated via trigger) |

**Indexes:**
- Primary key on `id`
- Unique index on `name`

### transactions
Records all treat transfers between cats.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique transaction identifier |
| sender_id | INTEGER | NOT NULL, FOREIGN KEY | ID of the cat sending treats |
| receiver_id | INTEGER | NOT NULL, FOREIGN KEY | ID of the cat receiving treats |
| amount | INTEGER | NOT NULL | Number of treats transferred |
| status | TEXT | DEFAULT 'completed' | Transaction status |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Transaction timestamp |

**Foreign Keys:**
- `sender_id` references `cats(id)` with CASCADE delete
- `receiver_id` references `cats(id)` with CASCADE delete

**Indexes:**
- Primary key on `id`
- Index on `sender_id` for querying sender transactions
- Index on `receiver_id` for querying receiver transactions
- Index on `created_at DESC` for chronological queries

### schema_migrations
Tracks which database migrations have been applied.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Migration record ID |
| migration_name | TEXT | NOT NULL, UNIQUE | Name of the migration file |
| applied_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When the migration was applied |

## Database Features

### Foreign Key Constraints
- Foreign keys are enabled with `PRAGMA foreign_keys = ON`
- Cascade deletes ensure data integrity when cats are removed

### Triggers
- `update_cats_timestamp`: Automatically updates the `updated_at` column when a cat record is modified

### Data Integrity
- Cat names must be unique
- Balance cannot be NULL (defaults to 0)
- Transactions require valid sender and receiver IDs

## Utility Functions

The `db-utils.js` module provides the following functions:

### Cat Operations
- `getAllCats()` - Retrieve all cats
- `getCatById(id)` - Get specific cat by ID
- `getCatByName(name)` - Get specific cat by name
- `updateCatBalance(id, newBalance)` - Update cat's balance
- `createCat(name, balance)` - Create new cat account

### Transaction Operations
- `createTransaction(senderId, receiverId, amount, status)` - Record a transaction
- `getAllTransactions(limit)` - Get recent transactions
- `getTransactionsByCatId(catId, limit)` - Get transactions for a specific cat
- `getTransactionById(id)` - Get specific transaction details

### Transfer Operations
- `performTransfer(senderId, receiverId, amount)` - Atomic transfer with balance updates

## Migration System

The database uses a migration system to track schema changes:

1. **Migration Files**: SQL files in the `migrations/` directory (e.g., `001_initial_schema.sql`)
2. **Migration Tracking**: The `schema_migrations` table records applied migrations
3. **Running Migrations**: Use `npm run migrate` to apply pending migrations

### Available Migrations
- `001_initial_schema.sql` - Creates cats and transactions tables with indexes
- `002_add_updated_at_trigger.sql` - Adds automatic timestamp update trigger

## Seeding Data

Initial data seeding includes 6 cats with varying balances:
- Whiskers: 100 treats
- Mittens: 50 treats
- Shadow: 75 treats
- Luna: 120 treats
- Oliver: 30 treats
- Simba: 200 treats

## Database Commands

### Initialize Database
```bash
npm run init-db
```

### Run Migrations
```bash
npm run migrate
```

### Reset Database
Delete the `meowpay.db` file and run `npm run init-db`

## Performance Considerations

1. **Indexes**: Strategic indexes on frequently queried columns (sender_id, receiver_id, created_at)
2. **Foreign Keys**: Indexed automatically by SQLite for join performance
3. **Atomic Operations**: Transfers use database transactions to ensure consistency
4. **Cascade Deletes**: Automatically clean up related data when cats are deleted

## Security Considerations

1. **Input Validation**: All inputs should be validated before database operations
2. **SQL Injection**: Use parameterized queries (implemented in utility functions)
3. **Transaction Isolation**: Proper transaction handling prevents race conditions
4. **Error Handling**: Comprehensive error handling in all database operations
