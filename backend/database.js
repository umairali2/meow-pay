const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'meowpay.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Create cats table
    db.run(`
      CREATE TABLE IF NOT EXISTS cats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating cats table:', err.message);
      } else {
        console.log('Cats table created or already exists');
      }
    });

    // Create transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES cats(id),
        FOREIGN KEY (receiver_id) REFERENCES cats(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating transactions table:', err.message);
      } else {
        console.log('Transactions table created or already exists');
      }
    });

    // Seed initial data
    seedData();
  });
};

const seedData = () => {
  // Check if we already have cats
  db.get('SELECT COUNT(*) as count FROM cats', (err, row) => {
    if (err) {
      console.error('Error checking cats:', err.message);
      return;
    }

    if (row.count === 0) {
      // Insert sample cats
      const cats = [
        { name: 'Whiskers', balance: 100 },
        { name: 'Mittens', balance: 50 },
        { name: 'Shadow', balance: 75 }
      ];

      const stmt = db.prepare('INSERT INTO cats (name, balance) VALUES (?, ?)');
      
      cats.forEach(cat => {
        stmt.run(cat.name, cat.balance, (err) => {
          if (err) {
            console.error('Error inserting cat:', err.message);
          } else {
            console.log(`Inserted cat: ${cat.name} with ${cat.balance} treats`);
          }
        });
      });

      stmt.finalize();
    } else {
      console.log('Database already contains data');
    }
  });
};

module.exports = { db, initializeDatabase };
