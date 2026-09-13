# MeowPay Testing Guide

This document describes the testing approach, available test suites, and manual testing procedures for the MeowPay application.

## Test Suites

### 1. API Tests (`npm test`)
Basic smoke tests for all major API endpoints to verify backend connectivity.

```bash
cd backend
npm test
```

**Coverage:**
- Health check endpoint
- Get all cats
- Get transactions
- Transaction statistics
- Transfer validation
- API info

### 2. Integration Tests (`npm run test:integration`)
Comprehensive API endpoint testing to verify frontend-backend connectivity.

```bash
cd backend
npm run test:integration
```

**Coverage:**
- All API endpoints
- CORS configuration
- Request/response formats
- Database connectivity

### 3. Manual Tests (`npm run test:manual`)
End-to-end transfer flow testing with database reset and edge case coverage.

```bash
cd backend
# Start server first (with rate limiting disabled for tests)
SKIP_RATE_LIMIT=true npm run dev:simple

# In another terminal
npm run test:manual
```

**Coverage:**
- Initial state verification
- Successful transfers
- Self-transfer prevention
- Insufficient balance handling
- Invalid amount rejection (zero, negative)
- Over-limit transfer rejection
- Multiple consecutive transfers
- Transfer validation preview
- Invalid receiver ID handling
- Database integrity (conservation of treats)

## Manual Testing Scenarios

### Scenario 1: Successful Transfer
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId":1,"receiverId":2,"amount":25}'
```

**Expected Result:**
- Status 200
- Confirmation code generated
- Sender balance decreased
- Receiver balance increased
- Transaction recorded

### Scenario 2: Self-Transfer Prevention
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId":1,"receiverId":1,"amount":10}'
```

**Expected Result:**
- Status 400
- Error: "senderId and receiverId must be different"

### Scenario 3: Insufficient Balance
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId":5,"receiverId":1,"amount":100}'
```

**Expected Result:**
- Status 400
- Error: "Insufficient balance. Sender has 30 treats, but tried to transfer 100"
- Includes balance details (currentBalance, requestedAmount, deficit)

### Scenario 4: Invalid Amount (Zero)
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId":1,"receiverId":2,"amount":0}'
```

**Expected Result:**
- Status 400
- Error: Missing required fields or amount must be positive

### Scenario 5: Invalid Amount (Negative)
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId":1,"receiverId":2,"amount":-10}'
```

**Expected Result:**
- Status 400
- Error: "amount must be a positive number"

### Scenario 6: Over-Limit Transfer
```bash
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"senderId":6,"receiverId":1,"amount":50000}'
```

**Expected Result:**
- Status 400
- Error: Transfer cannot exceed 10,000 treats per transaction

### Scenario 7: Transfer Validation
```bash
curl -X POST http://localhost:3001/api/transfer/validate \
  -H "Content-Type: application/json" \
  -d '{"senderId":6,"receiverId":1,"amount":50}'
```

**Expected Result:**
- Status 200
- valid: true
- Shows new sender and receiver balances

## Test Results Format

All test suites output structured results with pass/fail status:

```
📈 Test Results: X passed, Y failed
```

For manual tests, each test provides:
- Test name
- Pass/fail status
- Detailed result information
- Timestamps

## Rate Limiting in Tests

The transfer endpoint has rate limiting (10 transfers per minute by default). For automated manual testing, use:

```bash
SKIP_RATE_LIMIT=true node server.js
```

In production, never disable rate limiting. The `SKIP_RATE_LIMIT` option is only for test environments.

## Database Reset

For manual testing, the `npm run test:manual` script automatically:
1. Clears all transactions
2. Resets all cat balances to seed values
3. Verifies the initial state

This ensures each test run starts from a clean state.

## Seed Data

The database is seeded with 6 cats:
- Whiskers: 100 treats
- Mittens: 50 treats
- Shadow: 75 treats
- Luna: 120 treats
- Oliver: 30 treats
- Simba: 200 treats

Total treats in the system: 575 (should be conserved)

## Database Integrity

A critical invariant is that the total number of treats in the system remains constant:

```
Total treats = sum of all cat balances + sum of all transaction amounts
```

Since treats are transferred between cats (not created or destroyed), the sum of all cat balances should always equal 575.

## Frontend Testing

To test the frontend manually:

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Open the browser at the URL shown (usually http://localhost:3000 or http://localhost:3002)

4. Test the following flows:
   - View cat accounts and balances
   - View transaction history
   - Validate a transfer
   - Execute a transfer
   - View the transaction receipt
   - Verify balances update in real-time
   - Test error cases in the UI

## Continuous Testing

For CI/CD, the integration test suite (`npm run test:integration`) is recommended as it doesn't require rate limiting bypass and covers all critical API endpoints.

## Test Environment Variables

```env
API_URL=http://localhost:3001       # API base URL for tests
SKIP_RATE_LIMIT=true                # Disable rate limiting (tests only)
DB_PATH=./meowpay.db               # Database path for reset
```
