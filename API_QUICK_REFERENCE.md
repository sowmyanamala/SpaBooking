# API Quick Reference

Quick reference guide for developers working with the Spa Booking Platform APIs.

## Public Endpoints

```bash
# Get all therapists with verification status
GET /api/therapists-with-verification?location=New+York&gender=female

# Response: Array of therapist objects with verified field
```

## Admin - Therapists

```bash
# List therapists (paginated)
GET /api/admin/therapists?page=1&limit=25&q=john

# Update therapist status
PUT /api/admin/therapists?id=123
{"status": "active"} # or "suspended"

# Delete therapist
DELETE /api/admin/therapists?id=123

# Toggle verification
PUT /api/admin/toggle-verification?id=123
{"verified": true}
```

## Admin - Users

```bash
# List users
GET /api/admin/users?page=1&limit=25&q=jane

# Update user
PUT /api/admin/users?id=456
{"name": "Updated Name", "email": "new@example.com"}

# Delete user
DELETE /api/admin/users?id=456
```

## Admin - Services

```bash
# List services
GET /api/admin/services?page=1&limit=25&q=massage

# Create service
POST /api/admin/services
{"name": "New Service"}

# Update service
PUT /api/admin/services?id=service-id
{"name": "Updated Name"}

# Delete service
DELETE /api/admin/services?id=service-id
```

## Payment

```bash
# Process Square payment
POST /api/pay
{
  "sourceId": "card-nonce",
  "amount": 15000,
  "customerdb_id": 123,
  "model_id": 456,
  "service_address": "123 Main St",
  "service_type": "Swedish Massage",
  "service_time": "2025-10-15 14:00:00"
}
```

## Database Utilities

```bash
# Check table structure
GET /api/admin/check-table-structure

# Add verified column
POST /api/admin/add-verified-column
```

## Response Formats

### Success

```json
{
  "success": 1,
  "data": [...],
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": 0,
  "message": "Error description"
}
```

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_USER=msgdbusr
DB_PASSWORD=your_password
DB_NAME=msgdb
DB_PORT=3306

# Square
SQUARE_ACCESS_TOKEN=your_token

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret

# Stripe
STRIPE_SECRET_KEY=your_key
```

## HTTP Status Codes

| Code | Meaning            |
| ---- | ------------------ |
| 200  | Success            |
| 400  | Bad Request        |
| 401  | Unauthorized       |
| 404  | Not Found          |
| 405  | Method Not Allowed |
| 500  | Server Error       |
| 502  | Upstream Error     |
| 504  | Timeout            |

## Common Headers

```bash
# Authentication
Authorization: Bearer <jwt_token>

# Content Type
Content-Type: application/json

# CORS (handled automatically)
Allow: GET,POST,PUT,DELETE,OPTIONS
```

## Testing with cURL

```bash
# GET request
curl http://localhost:3005/api/therapists-with-verification

# POST request
curl -X POST http://localhost:3005/api/admin/services \
  -H "Content-Type: application/json" \
  -d '{"name":"New Service"}'

# PUT request
curl -X PUT "http://localhost:3005/api/admin/therapists?id=123" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'

# DELETE request
curl -X DELETE "http://localhost:3005/api/admin/users?id=456"
```

## Testing with JavaScript/Fetch

```javascript
// GET request
const response = await fetch(
  "/api/therapists-with-verification?location=New York"
);
const data = await response.json();

// POST request
const response = await fetch("/api/admin/services", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "New Service" }),
});

// PUT request
const response = await fetch("/api/admin/therapists?id=123", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "active" }),
});

// DELETE request
const response = await fetch("/api/admin/users?id=456", {
  method: "DELETE",
});
```

## Pagination Pattern

```javascript
// Example: Paginate through all therapists
async function getAllTherapists() {
  let page = 1;
  let allTherapists = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`/api/admin/therapists?page=${page}&limit=25`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      allTherapists = [...allTherapists, ...data.data];
      page++;
      hasMore = data.data.length === data.limit;
    } else {
      hasMore = false;
    }
  }

  return allTherapists;
}
```

## Error Handling Pattern

```javascript
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    // Show user-friendly error message
    alert("An error occurred. Please try again.");
    throw error;
  }
}

// Usage
try {
  const result = await apiCall("/api/admin/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "New Service" }),
  });
  console.log("Success:", result);
} catch (error) {
  // Handle error
}
```

## Database Schema (Models Table)

```sql
CREATE TABLE models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  age INT,
  gender ENUM('male', 'female', 'other'),
  ethnicity VARCHAR(100),
  service_area VARCHAR(255),
  service_area_primary VARCHAR(255),
  price DECIMAL(10,2),
  status ENUM('ready', 'pending') DEFAULT 'ready',
  verified TINYINT(1) DEFAULT 0 COMMENT 'Verification status',
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Useful SQL Queries

```sql
-- Get all verified therapists
SELECT * FROM models WHERE verified = 1;

-- Count therapists by status
SELECT status, COUNT(*) as count FROM models GROUP BY status;

-- Find therapists needing verification
SELECT id, name, email FROM models WHERE verified = 0 AND status = 'ready';

-- Update therapist verification
UPDATE models SET verified = 1, updated_at = NOW() WHERE id = 123;
```

## TypeScript Types (Optional)

```typescript
// Response types
interface ApiResponse<T> {
  success: 1 | 0;
  data: T;
  message: string;
  page?: number;
  limit?: number;
  total?: number;
}

interface Therapist {
  id: number;
  name: string;
  email?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  ethnicity?: string;
  service_area?: string;
  service_area_primary?: string;
  price?: number;
  status: "active" | "suspended";
  verified: boolean;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

interface Service {
  id: string;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
}
```

---

For full documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
