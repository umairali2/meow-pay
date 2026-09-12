const { db } = require('./database');

// Cat operations
const catOperations = {
  // Get all cats
  getAllCats: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, balance, created_at FROM cats ORDER BY name', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get cat by ID
  getCatById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, balance, created_at FROM cats WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get cat by name
  getCatByName: (name) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, balance, created_at FROM cats WHERE name = ?', [name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Update cat balance
  updateCatBalance: (id, newBalance) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE cats SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes, id });
          }
        }
      );
    });
  },

  // Create new cat
  createCat: (name, balance = 0) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO cats (name, balance) VALUES (?, ?)',
        [name, balance],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, name, balance });
          }
        }
      );
    });
  }
};

// Transaction operations
const transactionOperations = {
  // Create transaction
  createTransaction: (senderId, receiverId, amount, status = 'completed') => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO transactions (sender_id, receiver_id, amount, status) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, amount, status],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, senderId, receiverId, amount, status });
          }
        }
      );
    });
  },

  // Get all transactions
  getAllTransactions: (limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT t.*, 
         sender.name as sender_name, 
         receiver.name as receiver_name
         FROM transactions t
         JOIN cats sender ON t.sender_id = sender.id
         JOIN cats receiver ON t.receiver_id = receiver.id
         ORDER BY t.created_at DESC
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Get transactions for a specific cat
  getTransactionsByCatId: (catId, limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT t.*, 
         sender.name as sender_name, 
         receiver.name as receiver_name
         FROM transactions t
         JOIN cats sender ON t.sender_id = sender.id
         JOIN cats receiver ON t.receiver_id = receiver.id
         WHERE t.sender_id = ? OR t.receiver_id = ?
         ORDER BY t.created_at DESC
         LIMIT ?`,
        [catId, catId, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Get transaction by ID
  getTransactionById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT t.*, 
         sender.name as sender_name, 
         receiver.name as receiver_name
         FROM transactions t
         JOIN cats sender ON t.sender_id = sender.id
         JOIN cats receiver ON t.receiver_id = receiver.id
         WHERE t.id = ?`,
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }
};

// Transfer operation (atomic transaction)
const performTransfer = async (senderId, receiverId, amount) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Get current balances
      db.get('SELECT balance FROM cats WHERE id = ?', [senderId], (err, sender) => {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        if (!sender) {
          db.run('ROLLBACK');
          return reject(new Error('Sender not found'));
        }
        if (sender.balance < amount) {
          db.run('ROLLBACK');
          return reject(new Error('Insufficient balance'));
        }

        // Get receiver
        db.get('SELECT balance FROM cats WHERE id = ?', [receiverId], (err, receiver) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          if (!receiver) {
            db.run('ROLLBACK');
            return reject(new Error('Receiver not found'));
          }

          // Update sender balance
          db.run(
            'UPDATE cats SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [amount, senderId],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }

              // Update receiver balance
              db.run(
                'UPDATE cats SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [amount, receiverId],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }

                  // Record transaction
                  db.run(
                    'INSERT INTO transactions (sender_id, receiver_id, amount, status) VALUES (?, ?, ?, ?)',
                    [senderId, receiverId, amount, 'completed'],
                    function(err) {
                      if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                      }

                      db.run('COMMIT', (err) => {
                        if (err) {
                          db.run('ROLLBACK');
                          return reject(err);
                        }

                        resolve({
                          success: true,
                          transactionId: this.lastID,
                          senderId,
                          receiverId,
                          amount,
                          newSenderBalance: sender.balance - amount,
                          newReceiverBalance: receiver.balance + amount
                        });
                      });
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
  });
};

module.exports = {
  catOperations,
  transactionOperations,
  performTransfer
};
