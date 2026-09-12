-- Migration 001: Initial schema
-- This creates the basic MeowPay database structure

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create cats table
CREATE TABLE IF NOT EXISTS cats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES cats(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES cats(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
