# Spa Booking Platform - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Public APIs](#public-apis)
5. [Admin APIs](#admin-apis)
6. [Payment APIs](#payment-apis)
7. [External Dependencies](#external-dependencies)
8. [Error Handling](#error-handling)
9. [Response Format](#response-format)

---

## Overview

This documentation covers all API endpoints for verification, payment processing, and admin management features.

### Technology Stack

- **Framework:** Next.js (API Routes)
- **Database:** MySQL
- **Payment Processors:** Square, PayPal
- **Authentication:** JWT-based

---

## Base URL

**Development:**

```
http://localhost:3005/api
```

**Production:**

```
https://spagram.com/api
```

**External PHP API:**

```
https://tsm.spagram.com/api
```

---

## Authentication

Most admin endpoints require authentication. Include the JWT token in requests:

```http
Authorization: Bearer <your_jwt_token>
```

**Token Storage:**

- Customer tokens: `localStorage.getItem('customertoken')`
- Model tokens: `localStorage.getItem('modelToken')`

---

## Public APIs

### 1. Get Therapists with Verification

Fetches all therapists and includes their verification status.

**Endpoint:** `/api/therapists-with-verification`

**Method:** `GET`

**Query Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| `location`    | string | No       | Filter by service area |
| `gender`      | string | No       | Filter by gender       |
| `ethnicity`   | string | No       | Filter by ethnicity    |
| `age`         | string | No       | Filter by age range    |
| `serviceType` | string | No       | Filter by service type |

**Example Request:**

```bash
GET /api/therapists-with-verification?location=New%20York&gender=female
```

**Success Response (200):**

```json
[
  {
    "id": 123,
    "name": "Jane Doe",
    "age": 28,
    "gender": "female",
    "ethnicity": "Asian",
    "service_area": "New York",
    "service_area_primary": "Manhattan",
    "price": 150,
    "status": "ready",
    "verified": true,
    "image": "https://example.com/image.jpg",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

**Error Response (500):**

```json
{
  "success": 0,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## Admin APIs

### 1. Manage Therapists

#### Get All Therapists

**Endpoint:** `/api/admin/therapists`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                |
| --------- | ------ | -------- | ------- | -------------------------- |
| `page`    | number | No       | 1       | Page number for pagination |
| `limit`   | number | No       | 25      | Items per page (max 100)   |
| `q`       | string | No       | ""      | Search query (name, email) |

**Example Request:**

```bash
GET /api/admin/therapists?page=1&limit=25&q=john
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": [
    {
      "id": 123,
      "name": "John Smith",
      "email": "john@example.com",
      "age": 30,
      "gender": "male",
      "status": "active",
      "verified": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 25,
  "total": 150,
  "message": "Therapists loaded successfully"
}
```

#### Update Therapist Status

**Endpoint:** `/api/admin/therapists`

**Method:** `PUT`

**Query Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| `id`      | number | Yes      | Therapist ID |

**Request Body:**

```json
{
  "status": "active" // or "suspended"
}
```

**Example Request:**

```bash
PUT /api/admin/therapists?id=123
Content-Type: application/json

{
  "status": "suspended"
}
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": {},
  "message": "Therapist suspended successfully"
}
```

**Error Response (400):**

```json
{
  "success": 0,
  "message": "Missing or invalid id"
}
```

#### Delete Therapist

**Endpoint:** `/api/admin/therapists`

**Method:** `DELETE`

**Query Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | number | Yes      | Therapist ID to delete |

**Example Request:**

```bash
DELETE /api/admin/therapists?id=123
```

**Success Response (200):**

```json
{
  "success": 1,
  "message": "Therapist deleted successfully"
}
```

---

### 2. Toggle Therapist Verification

Manually verify or unverify a therapist.

**Endpoint:** `/api/admin/toggle-verification`

**Method:** `PUT`

**Query Parameters:**

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| `id`      | number | Yes      | Therapist ID |

**Request Body:**

```json
{
  "verified": true // or false
}
```

**Example Request:**

```bash
PUT /api/admin/toggle-verification?id=123
Content-Type: application/json

{
  "verified": true
}
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": {
    "verified": true
  },
  "message": "Therapist verified successfully"
}
```

**Error Responses:**

**400 - Invalid Input:**

```json
{
  "success": 0,
  "message": "Invalid therapist ID"
}
```

**404 - Not Found:**

```json
{
  "success": 0,
  "message": "Therapist not found"
}
```

**500 - Database Error:**

```json
{
  "success": 0,
  "message": "Database error occurred",
  "error": "Error message",
  "details": {
    "code": "ER_ERROR_CODE",
    "errno": 1234,
    "sqlState": "42S22",
    "sqlMessage": "SQL error message"
  }
}
```

---

### 3. Manage Users

#### Get All Users

**Endpoint:** `/api/admin/users`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type   | Required | Default | Description    |
| --------- | ------ | -------- | ------- | -------------- |
| `page`    | number | No       | 1       | Page number    |
| `limit`   | number | No       | 25      | Items per page |
| `q`       | string | No       | ""      | Search query   |

**Example Request:**

```bash
GET /api/admin/users?page=1&limit=25
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": [
    {
      "id": 456,
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 25,
  "total": 1000
}
```

#### Update User

**Endpoint:** `/api/admin/users`

**Method:** `PUT`

**Query Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | number | Yes      | User ID     |

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+1234567890"
}
```

**Example Request:**

```bash
PUT /api/admin/users?id=456
Content-Type: application/json

{
  "name": "Updated Name"
}
```

**Success Response (200):**

```json
{
  "success": 1,
  "message": "User updated successfully"
}
```

#### Delete User

**Endpoint:** `/api/admin/users`

**Method:** `DELETE`

**Query Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | number | Yes      | User ID     |

**Example Request:**

```bash
DELETE /api/admin/users?id=456
```

**Success Response (200):**

```json
{
  "success": 1,
  "message": "User deleted successfully"
}
```

---

### 4. Manage Services

#### Get All Services

**Endpoint:** `/api/admin/services`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type   | Required | Default | Description    |
| --------- | ------ | -------- | ------- | -------------- |
| `page`    | number | No       | 1       | Page number    |
| `limit`   | number | No       | 25      | Items per page |
| `q`       | string | No       | ""      | Search query   |

**Example Request:**

```bash
GET /api/admin/services?page=1&limit=25&q=massage
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": [
    {
      "id": "swedish-massage",
      "name": "Swedish Massage"
    },
    {
      "id": "deep-tissue",
      "name": "Deep Tissue Massage"
    }
  ],
  "page": 1,
  "limit": 25,
  "total": 15,
  "message": "Services loaded successfully"
}
```

#### Create Service

**Endpoint:** `/api/admin/services`

**Method:** `POST`

**Request Body:**

```json
{
  "name": "New Service Name"
}
```

**Example Request:**

```bash
POST /api/admin/services
Content-Type: application/json

{
  "name": "Hot Stone Massage"
}
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": {
    "id": "hot-stone-massage",
    "name": "Hot Stone Massage"
  },
  "message": "Service created successfully"
}
```

**Error Response (400):**

```json
{
  "success": 0,
  "message": "Service name is required"
}
```

#### Update Service

**Endpoint:** `/api/admin/services`

**Method:** `PUT`

**Query Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | Service ID  |

**Request Body:**

```json
{
  "name": "Updated Service Name"
}
```

**Example Request:**

```bash
PUT /api/admin/services?id=swedish-massage
Content-Type: application/json

{
  "name": "Swedish Massage (Updated)"
}
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": {
    "id": "swedish-massage",
    "name": "Swedish Massage (Updated)"
  },
  "message": "Service updated successfully"
}
```

#### Delete Service

**Endpoint:** `/api/admin/services`

**Method:** `DELETE`

**Query Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | Service ID  |

**Example Request:**

```bash
DELETE /api/admin/services?id=hot-stone-massage
```

**Success Response (200):**

```json
{
  "success": 1,
  "data": {},
  "message": "Service deleted successfully"
}
```

---

### 5. Database Utility APIs

#### Check Table Structure

**Endpoint:** `/api/admin/check-table-structure`

**Method:** `GET`

**Description:** Checks database table structure and displays column information.

**Example Request:**

```bash
GET /api/admin/check-table-structure
```

**Success Response (200):**

```json
{
  "success": 1,
  "message": "Database structure retrieved",
  "tables": {
    "models": [
      {
        "Field": "id",
        "Type": "int(11)",
        "Null": "NO",
        "Key": "PRI"
      },
      {
        "Field": "verified",
        "Type": "tinyint(1)",
        "Null": "YES",
        "Default": "0"
      }
    ]
  }
}
```

#### Add Verified Column

**Endpoint:** `/api/admin/add-verified-column`

**Method:** `POST`

**Description:** Adds `verified` column to models table if it doesn't exist.

**Example Request:**

```bash
POST /api/admin/add-verified-column
```

**Success Response (200):**

```json
{
  "success": 1,
  "message": "Verified column added successfully"
}
```

---

## Payment APIs

### 1. Square Payment (Card Processing)

**Endpoint:** `/api/pay`

**Method:** `POST`

**Description:** Processes payment via Square and creates customer card.

**Request Body:**

```json
{
  "sourceId": "cnon:card-nonce-ok",
  "amount": 15000,
  "customerdb_id": 123,
  "model_id": 456,
  "service_address": "123 Main St",
  "service_type": "Swedish Massage",
  "service_time": "2025-10-15 14:00:00"
}
```

**Example Request:**

```bash
POST /api/pay
Content-Type: application/json

{
  "sourceId": "cnon:card-nonce-ok",
  "amount": 15000
}
```

**Success Response (200):**

```json
{
  "card": {
    "id": "ccof:uIbfJXhXETSP197M3GB",
    "card_brand": "VISA",
    "last_4": "1111",
    "exp_month": 12,
    "exp_year": 2025,
    "cardholder_name": "John Doe",
    "billing_address": {
      "address_line_1": "500 Electric Ave",
      "locality": "New York",
      "postal_code": "10003",
      "country": "US"
    },
    "customer_id": "8QWT7BRVW3D48",
    "reference_id": "user-asd222a2"
  }
}
```

**Error Response (500):**

```json
{
  "error": "Payment processing failed",
  "message": "Error details"
}
```

---

## External Dependencies

### External PHP APIs (tsm.spagram.com)

The platform relies on external PHP APIs for core data operations:

#### 1. Filter Models API

**URL:** `https://tsm.spagram.com/api/filter-models.php`

**Method:** `GET`

**Query Parameters:**

- `location` - Service area filter
- `gender` - Gender filter
- `ethnicity` - Ethnicity filter
- `age` - Age range filter
- `serviceType` - Service type filter

#### 2. Models API

**URL:** `https://tsm.spagram.com/api/models.php`

**Method:** `GET`

**Query Parameters:**

- `page` - Page number
- `limit` - Items per page
- `q` - Search query

#### 3. Therapists API

**URL:** `https://tsm.spagram.com/api/therapists.php`

**Methods:** `GET`, `PUT`, `DELETE`

**Query Parameters:**

- `page` - Page number
- `limit` - Items per page
- `q` - Search query
- `id` - Therapist ID (for PUT/DELETE)

#### 4. Users API

**URL:** `https://tsm.spagram.com/api/users.php`

**Methods:** `GET`, `PUT`, `DELETE`

**Query Parameters:**

- `page` - Page number
- `limit` - Items per page
- `q` - Search query
- `id` - User ID (for PUT/DELETE)

#### 5. Create Order API

**URL:** `https://tsm.spagram.com/api/create-order.php`

**Method:** `POST`

**Request Body:**

```json
{
  "customer_id": 123,
  "model_id": 456,
  "service_time": "2025-10-15 14:00:00",
  "call_type": "incall",
  "service_address": "Manhattan",
  "price": 150
}
```

#### 6. Verification Status API

**URL:** `https://tsm.spagram.com/api/get-verification-status.php`

**Method:** `GET`

**Response:**

```json
{
  "success": 1,
  "verified_ids": [123, 456, 789]
}
```

#### 7. Square Payment API

**URL:** `https://tsm.spagram.com/api/square/pay.php`

**Method:** `POST`

**Request Body:**

```json
{
  "sourceId": "card-token",
  "customerdb_id": 123,
  "model_id": 456,
  "service_address": "123 Main St",
  "service_type": "Swedish Massage",
  "service_time": "2025-10-15 14:00:00",
  "amount": 15000
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning               | Description                          |
| ---- | --------------------- | ------------------------------------ |
| 200  | OK                    | Request successful                   |
| 204  | No Content            | Request successful, no response body |
| 400  | Bad Request           | Invalid request parameters           |
| 401  | Unauthorized          | Authentication required              |
| 403  | Forbidden             | Insufficient permissions             |
| 404  | Not Found             | Resource not found                   |
| 405  | Method Not Allowed    | HTTP method not supported            |
| 500  | Internal Server Error | Server error occurred                |
| 502  | Bad Gateway           | Upstream API error                   |
| 504  | Gateway Timeout       | Upstream API timeout                 |

### Error Response Format

```json
{
  "success": 0,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common Error Messages

| Error                     | Cause                      | Solution                        |
| ------------------------- | -------------------------- | ------------------------------- |
| "Method not allowed"      | Wrong HTTP method          | Check endpoint documentation    |
| "Missing or invalid id"   | Invalid ID parameter       | Ensure ID is a positive integer |
| "Database error occurred" | Database connection failed | Check database credentials      |
| "Therapist not found"     | Invalid therapist ID       | Verify ID exists                |
| "Upstream error"          | External API failed        | Check external API status       |

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "success": 1,
  "data": [...], // or {}
  "message": "Operation successful",
  "page": 1, // Optional: for paginated responses
  "limit": 25, // Optional: for paginated responses
  "total": 100 // Optional: for paginated responses
}
```

### Error Response

All error responses follow this format:

```json
{
  "success": 0,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider adding rate limiting for production:

**Recommended Limits:**

- Public APIs: 100 requests per minute
- Admin APIs: 300 requests per minute
- Payment APIs: 10 requests per minute

---

## Security Considerations

### Best Practices

1. **Authentication:**

   - Always use HTTPS in production
   - Store JWT tokens securely (httpOnly cookies recommended)
   - Implement token refresh mechanism
   - Validate tokens on every admin request

2. **Input Validation:**

   - Sanitize all user inputs
   - Use parameterized queries to prevent SQL injection
   - Validate file uploads

3. **Database:**

   - Use environment variables for credentials
   - Never expose database passwords in responses
   - Implement connection pooling

4. **API Keys:**

   - Store API keys in environment variables
   - Rotate keys regularly
   - Use different keys for dev/staging/production

5. **Error Messages:**
   - Don't expose sensitive information in errors
   - Log detailed errors server-side
   - Return generic messages to clients

---

## Changelog

### Version 1.0.0 (Current)

- Initial API documentation
- Public therapist APIs
- Admin management APIs
- Payment integration (Square, PayPal)
- Verification system

---

## Support

For API support or questions:

- **Email:** support@spagram.com
- **Documentation:** https://spagram.com/docs
- **Status Page:** https://status.spagram.com

---

## License

Copyright © 2025 Spagram. All rights reserved.

