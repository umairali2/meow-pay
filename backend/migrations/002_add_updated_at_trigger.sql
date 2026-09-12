-- Migration 002: Add trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_cats_timestamp 
AFTER UPDATE ON cats
BEGIN
  UPDATE cats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
