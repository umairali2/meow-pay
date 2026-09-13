# MeowPay API Documentation

## Overview
The MeowPay API provides endpoints for managing cat accounts and transferring treats between cats. All endpoints return JSON responses with consistent error handling and timestamps.

## Base URL
- Development: `http://localhost:3001`
- Production: (configured via environment variables)

## Authentication
Currently, the API does not require authentication. In a production environment, proper authentication should be implemented.

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Error description",
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /health
Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-13T10:30:00.000Z",
  "environment": "development"
}
```

### Cats

#### GET /api/cats
Get all cats with their current balances.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Whiskers",
      "balance": 100,
      "created_at": "2026-09-13T10:00:00.000Z"
    }
  ],
  "count": 1,
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

#### GET /api/cats/:id
Get a specific cat by ID.

**Parameters:**
- `id` (path parameter): Cat ID (positive integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Whiskers",
    "balance": 100,
    "created_at": "2026-09-13T10:00:00.000Z"
  },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid cat ID
- `404 Not Found`: Cat not found

#### POST /api/cats
Create a new cat account.

**Request Body:**
```json
{
  "name": "Fluffy",
  "balance": 50
}
```

**Parameters:**
- `name` (required): Cat name (string, max 50 characters)
- `balance` (optional): Initial balance (non-negative number, defaults to 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "Fluffy",
    "balance": 50
  },
  "message": "Cat created successfully",
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `409 Conflict`: Cat with this name already exists

### Transactions

#### GET /api/transactions
Get all transactions with optional filtering.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (1-100, defaults to 50)
- `senderId` (optional): Filter by sender cat ID
- `receiverId` (optional): Filter by receiver cat ID
- `status` (optional): Filter by transaction status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "amount": 25,
      "status": "completed",
      "created_at": "2026-09-13T10:15:00.000Z",
      "sender_name": "Whiskers",
      "receiver_name": "Mittens"
    }
  ],
  "count": 1,
  "filters": {
    "senderId": null,
    "receiverId": null,
    "status": null
  },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

#### GET /api/transactions/statistics
Get comprehensive transaction statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 15,
    "totalTreatsTransferred": 375,
    "averageTransferAmount": 25,
    "mostActiveCats": [
      {
        "catId": 1,
        "transactionCount": 8
      }
    ],
    "largestTransactions": [
      {
        "id": 5,
        "sender_id": 1,
        "receiver_id": 2,
        "amount": 100,
        "status": "completed",
        "created_at": "2026-09-13T10:15:00.000Z",
        "sender_name": "Whiskers",
        "receiver_name": "Mittens"
      }
    ],
    "recentTransactions": [...]
  },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

#### GET /api/transactions/cat/:catId
Get transactions for a specific cat (both sent and received) with statistics.

**Parameters:**
- `catId` (path parameter): Cat ID (positive integer)
- `limit` (optional): Number of transactions to return (1-100, defaults to 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "amount": 25,
      "status": "completed",
      "created_at": "2026-09-13T10:15:00.000Z",
      "sender_name": "Whiskers",
      "receiver_name": "Mittens"
    }
  ],
  "count": 1,
  "catId": 1,
  "statistics": {
    "sentCount": 5,
    "receivedCount": 3,
    "totalSent": 125,
    "totalReceived": 75,
    "netBalance": -50
  },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid cat ID or limit

#### GET /api/transactions/:id
Get a specific transaction by ID.

**Parameters:**
- `id` (path parameter): Transaction ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "amount": 25,
    "status": "completed",
    "created_at": "2026-09-13T10:15:00.000Z",
    "sender_name": "Whiskers",
    "receiver_name": "Mittens"
  },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Transaction not found

### Transfer

#### POST /api/transfer
Transfer treats from one cat to another with receipt generation.

**Request Body:**
```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 25
}
```

**Parameters:**
- `senderId` (required): ID of the cat sending treats (positive integer)
- `receiverId` (required): ID of the cat receiving treats (positive integer)
- `amount` (required): Number of treats to transfer (positive number, max 10,000,000 for validation purposes)

**Note:** This endpoint has relaxed validation limits (up to 10M treats) to allow users to preview larger transfers, though the actual transfer endpoint limits to 10,000 treats per transaction.

**Validation Rules:**
- senderId and receiverId must be different
- senderId and receiverId must be valid positive integers
- amount must be a positive finite number
- amount cannot exceed 10,000 (business limit)
- Both cats must exist
- Sender must have sufficient balance
- Duplicate transfer prevention (same sender, receiver, amount within 1 minute)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": 5,
    "timestamp": "2026-09-13T10:30:00.000Z",
    "processingTimeMs": 45,
    "from": {
      "id": 1,
      "name": "Whiskers",
      "previousBalance": 100,
      "newBalance": 75
    },
    "to": {
      "id": 2,
      "name": "Mittens",
      "previousBalance": 50,
      "newBalance": 75
    },
    "amount": 25,
    "status": "completed",
    "confirmationCode": "TXN-5-k4j92m-X7B3K9"
  },
  "message": "Successfully transferred 25 treats from Whiskers to Mittens",
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data, insufficient balance, self-transfer, amount exceeds limit, or duplicate transfer
- `404 Not Found`: Sender or receiver cat not found
- `500 Internal Server Error`: Database or server error

**Special Features:**
- **Receipt Generation**: Each transfer generates a unique confirmation code (e.g., `TXN-5-k4j92m-X7B3K9`)
- **Processing Time**: Response includes transfer processing time in milliseconds
- **Duplicate Prevention**: Prevents duplicate transfers within 1 minute
- **Transfer Limits**: Maximum 10,000 treats per single transfer

#### POST /api/transfer/validate
Validate a transfer request without executing it.

**Request Body:**
```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 25
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "sender": {
      "id": 1,
      "name": "Whiskers",
      "currentBalance": 100,
      "sufficient": true
    },
    "receiver": {
      "id": 2,
      "name": "Mittens",
      "currentBalance": 50
    },
    "transfer": {
      "amount": 25,
      "feasible": true,
      "newSenderBalance": 75,
      "newReceiverBalance": 75
    }
  },
  "timestamp": "2026-09-13T10:30:00.000Z"
}
```

**Use Case:** Use this endpoint to validate transfers before execution, allowing users to preview the outcome and confirm before finalizing.

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error - Server error |

## Rate Limiting
Currently, there is no rate limiting implemented. In production, rate limiting should be added to prevent abuse.

## CORS
The API supports CORS for the following origins:
- Development: `http://localhost:3000`, `http://localhost:3001`
- Production: Configured via `FRONTEND_URL` environment variable

## Testing the API

### Using cURL

#### Get all cats
```bash
curl http://localhost:3001/api/cats
```

#### Create a transfer
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId": 1, "receiverId": 2, "amount": 25}'

# Validate a transfer before execution
curl -X POST http://localhost:3001/api/transfer/validate \
  -H "Content-Type: application/json" \
  -d '{"senderId": 1, "receiverId": 2, "amount": 25}'
```

#### Get transactions
```bash
curl http://localhost:3001/api/transactions

# With filters
curl "http://localhost:3001/api/transactions?senderId=1&limit=10"

# Get transaction statistics
curl http://localhost:3001/api/transactions/statistics

# Get cat-specific transactions
curl http://localhost:3001/api/transactions/cat/1
```

### Using JavaScript/Fetch

```javascript
// Get all cats
fetch('http://localhost:3001/api/cats')
  .then(response => response.json())
  .then(data => console.log(data));

// Create a transfer
fetch('http://localhost:3001/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    senderId: 1,
    receiverId: 2,
    amount: 25
  })
})
  .then(response => response.json())
  .then(data => console.log(data));

// Validate a transfer before execution
fetch('http://localhost:3001/api/transfer/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    senderId: 1,
    receiverId: 2,
    amount: 25
  })
})
  .then(response => response.json())
  .then(data => console.log(data));

// Get transactions with filtering
fetch('http://localhost:3001/api/transactions?senderId=1&limit=10')
  .then(response => response.json())
  .then(data => console.log(data));

// Get transaction statistics
fetch('http://localhost:3001/api/transactions/statistics')
  .then(response => response.json())
  .then(data => console.log(data));

// Get cat-specific transactions
fetch('http://localhost:3001/api/transactions/cat/1')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Security Considerations

### Current Limitations
1. No authentication/authorization
2. No rate limiting
3. No input sanitization beyond basic validation
4. No request signing
5. No HTTPS enforcement

### Recommended Improvements
1. Implement JWT or OAuth2 authentication
2. Add rate limiting per user/IP
3. Implement request signing for sensitive operations
4. Add comprehensive input sanitization
5. Enable HTTPS in production
6. Add request logging and monitoring
7. Implement API key management
8. Add role-based access control

## Database Operations

All database operations use transactions where appropriate to ensure data integrity:
- Transfer operations are atomic (all updates succeed or all fail)
- Balance updates are performed within database transactions
- Foreign key constraints ensure referential integrity
- Cascade deletes handle related data cleanup

## Performance Considerations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: SQLite handles connection management
3. **Query Optimization**: Efficient SQL queries with proper joins
4. **Caching**: Consider adding Redis for frequently accessed data
5. **Pagination**: Limit parameters on list endpoints

## Monitoring and Logging

The API currently logs:
- All incoming requests (method, path, timestamp)
- Error messages and stack traces (in development)
- Database connection status

Recommended additions:
- Structured logging (JSON format)
- Request/response timing
- Error tracking (e.g., Sentry)
- Performance metrics
- Alerting for critical errors
