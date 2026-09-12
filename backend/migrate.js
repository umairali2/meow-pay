const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'meowpay.db');
const migrationsDir = path.join(__dirname, 'migrations');

console.log('Running database migrations...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create migrations table to track which migrations have been run
const createMigrationsTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        migration_name TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Get list of migration files
const getMigrationFiles = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(migrationsDir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const migrationFiles = files
          .filter(file => file.endsWith('.sql'))
          .sort();
        resolve(migrationFiles);
      }
    });
  });
};

// Get applied migrations
const getAppliedMigrations = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT migration_name FROM schema_migrations ORDER BY migration_name', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const applied = rows.map(row => row.migration_name);
        resolve(applied);
      }
    });
  });
};

// Run a single migration
const runMigration = (migrationFile) => {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(migrationsDir, migrationFile);
    
    fs.readFile(migrationPath, 'utf8', (err, sql) => {
      if (err) {
        reject(err);
        return;
      }

      db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          // Record this migration as applied
          db.run(
            'INSERT INTO schema_migrations (migration_name) VALUES (?)',
            [migrationFile],
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`✓ Applied migration: ${migrationFile}`);
                resolve();
              }
            }
          );
        }
      });
    });
  });
};

// Main migration process
const runMigrations = async () => {
  try {
    await createMigrationsTable();
    console.log('✓ Migrations table ready');

    const migrationFiles = await getMigrationFiles();
    console.log(`Found ${migrationFiles.length} migration files`);

    const appliedMigrations = await getAppliedMigrations();
    console.log(`Already applied: ${appliedMigrations.length} migrations`);

    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run');
      db.close(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migrations...`);

    for (const migrationFile of pendingMigrations) {
      await runMigration(migrationFile);
    }

    console.log('All migrations completed successfully!');
    db.close(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Migration failed:', error.message);
    db.close(() => {
      console.log('Database connection closed');
      process.exit(1);
    });
  }
};

// Run migrations
runMigrations();
