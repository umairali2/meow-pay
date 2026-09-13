# MeowPay Backend API

A comprehensive REST API for the MeowPay digital wallet system, allowing cats to transfer treats with real persistence and business logic.

## Features

- **🐱 Cat Management**: Create and manage cat accounts with treat balances
- **💳 Transaction System**: Complete treat transfer system with receipt generation
- **📊 Analytics**: Transaction statistics and cat-specific analytics
- **🔒 Security**: Input validation, rate limiting, and duplicate prevention
- **🏥 Health Monitoring**: Comprehensive health checks with database status
- **🧪 Testing**: Built-in API testing utilities
- **📖 Documentation**: Complete API documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Additional**: CORS, dotenv, node-fetch

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize the database:
```bash
npm run init-db
```

4. Start the server:
```bash
# Development mode with database initialization
npm run dev

# Simple development mode
npm run dev:simple

# Production mode
NODE_ENV=production npm start
```

The API will be available at `http://localhost:3001`

## Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with database init
npm run dev:simple     # Start simple development server
npm run init-db        # Initialize database with seed data
npm run migrate        # Run database migrations
npm test               # Run API tests
```

## API Endpoints

### Health & Info
- `GET /health` - Health check with database status
- `GET /` - API overview
- `GET /api/info` - Detailed API information

### Cats
- `GET /api/cats` - Get all cats
- `GET /api/cats/:id` - Get specific cat
- `POST /api/cats` - Create new cat

### Transactions
- `GET /api/transactions` - Get all transactions with filtering
- `GET /api/transactions/statistics` - Get transaction analytics
- `GET /api/transactions/cat/:catId` - Get cat-specific transactions
- `GET /api/transactions/:id` - Get specific transaction

### Transfers
- `POST /api/transfer` - Execute treat transfer
- `POST /api/transfer/validate` - Validate transfer without execution

## Database Schema

### Cats Table
- `id` - Primary key
- `name` - Cat name (unique)
- `balance` - Current treat balance
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Transactions Table
- `id` - Primary key
- `sender_id` - Sender cat ID (foreign key)
- `receiver_id` - Receiver cat ID (foreign key)
- `amount` - Treats transferred
- `status` - Transaction status
- `created_at` - Transaction timestamp

## Features Details

### Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Strict**: 50 requests per 15 minutes per IP
- **Transfers**: 10 transfers per minute per IP

### Transfer Validation
- Sender/receiver existence checks
- Sufficient balance verification
- Self-transfer prevention
- Maximum transfer limits (10,000 treats)
- Duplicate transfer prevention (1-minute window)

### Receipt Generation
- Unique confirmation codes (e.g., `TXN-5-k4j92m-X7B3K9`)
- Processing time tracking
- Detailed balance changes
- Transaction metadata

## Testing

### Run API Tests
```bash
npm test
```

### Test Specific Endpoints
```javascript
const { testGetCats, testTransferValidation } = require('./test-api');

await testGetCats();
await testTransferValidation();
```

### Custom API URL
```bash
API_URL=http://your-api-url npm test
```

## Environment Variables

```env
PORT=3001                          # Server port
NODE_ENV=development              # Environment mode
FRONTEND_URL=http://localhost:3000 # CORS configuration
DB_PATH=./meowpay.db             # Database file path
```

## Development

### Project Structure
```
backend/
├── server.js              # Main Express server
├── dev.js                 # Development startup script
├── database.js            # Database connection and initialization
├── db-utils.js            # Database utility functions
├── test-api.js            # API testing utilities
├── init-db.js             # Database initialization script
├── migrate.js             # Database migration script
├── routes/                # API route modules
│   ├── cats.js
│   ├── transactions.js
│   └── transfer.js
├── middleware/            # Custom middleware
│   ├── validation.js
│   └── rateLimit.js
├── migrations/            # Database migration files
│   ├── 001_initial_schema.sql
│   └── 002_add_updated_at_trigger.sql
└── meowpay.db            # SQLite database (created after init)
```

### Adding New Endpoints

1. Create route file in `routes/`
2. Add validation in `middleware/validation.js`
3. Mount route in `server.js`
4. Update API documentation
5. Add tests in `test-api.js`

### Database Migrations

1. Create new migration file in `migrations/` with format `XXX_description.sql`
2. Run `npm run migrate` to apply migrations
3. Migration files are tracked in `schema_migrations` table

## Security Considerations

### Current Implementation
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- Rate limiting to prevent abuse
- CORS configuration
- Error message sanitization in production

### Recommended Enhancements
- Authentication/authorization (JWT/OAuth2)
- Request signing for sensitive operations
- HTTPS enforcement
- API key management
- Enhanced logging and monitoring
- Input sanitization beyond validation

## Performance

### Optimization Features
- Database indexes on frequently queried columns
- Foreign key constraints with indexes
- Efficient SQL queries with proper joins
- Connection pooling (SQLite managed)
- Request/response timing

### Monitoring
- Health check endpoint with system metrics
- Request logging with timestamps
- Processing time tracking
- Memory usage monitoring
- Database connection status

## Troubleshooting

### Database Issues
```bash
# Reset database
rm meowpay.db
npm run init-db
```

### Port Already in Use
```bash
# Change port in .env file
PORT=3002 npm start
```

### Migration Issues
```bash
# Check migration status
sqlite3 meowpay.db "SELECT * FROM schema_migrations"
```

## API Documentation

Complete API documentation is available at:
- Interactive: `http://localhost:3001/api/info`
- Detailed: See `API_DOCUMENTATION.md`

## License

ISC

## Support

For issues or questions, please refer to the main project README or contact the development team.
