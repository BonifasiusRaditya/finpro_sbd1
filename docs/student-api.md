# Student API Documentation

This document describes the Student API endpoints for the MBGku platform.

## Authentication

All student endpoints (except login) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Consistent Authentication Format

All authentication endpoints (government, school, and student) now use the same consistent format:

**Request Format:**

```json
{
  "identifier": "string", // province_id for gov, school_id for school, student_number for student
  "password": "string"
}
```

**Response Format:**

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "role": "student|school|government",
    "name": "string"
    // ... role-specific fields
  },
  "message": "Login successful"
}
```

## Endpoints

### 1. Student Authentication

#### POST `/api/student/auth/login`

Authenticate a student and receive a JWT token.

**Request Body:**

```json
{
  "identifier": "student_number",
  "password": "string"
}
```

**Response (200):**

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "role": "student",
    "name": "string",
    "student_number": "string",
    "class": "string",
    "grade": "string",
    "address": "string",
    "gender": "string",
    "birth_date": "YYYY-MM-DD",
    "school_id": "uuid",
    "created_at": "ISO_DATE"
  },
  "message": "Login successful"
}
```

**Error Responses:**

- `400`: Missing required fields
- `401`: Invalid credentials

**Example:**

```bash
curl -X POST http://localhost:3000/api/student/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "2024001",
    "password": "password123"
  }'
```

### 2. Student Profile Management

#### GET `/api/student/profile`

Get the authenticated student's profile with school information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "profile": {
      "id": "uuid",
      "name": "string",
      "student_number": "string",
      "class": "string",
      "grade": "string",
      "address": "string",
      "gender": "string",
      "birth_date": "YYYY-MM-DD",
      "school_id": "uuid",
      "created_at": "ISO_DATE",
      "school_name": "string",
      "school_npsn": "string"
    }
  }
}
```

**Example:**

```bash
curl -X GET http://localhost:3000/api/student/profile \
  -H "Authorization: Bearer <jwt_token>"
```

#### PUT `/api/student/profile`

Update the authenticated student's profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body (all fields optional):**

```json
{
  "name": "string",
  "address": "string",
  "gender": "male|female",
  "birth_date": "YYYY-MM-DD"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "id": "uuid",
      "name": "string",
      "student_number": "string",
      "class": "string",
      "grade": "string",
      "address": "string",
      "gender": "string",
      "birth_date": "YYYY-MM-DD",
      "school_id": "uuid",
      "created_at": "ISO_DATE",
      "school_name": "string",
      "school_npsn": "string"
    }
  }
}
```

**Error Responses:**

- `400`: Invalid data format
- `404`: Student not found

**Example:**

```bash
curl -X PUT http://localhost:3000/api/student/profile \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "address": "New Address 123",
    "gender": "male",
    "birth_date": "2005-01-15"
  }'
```

### 3. Password Management

#### PUT `/api/student/change-password`

Change the authenticated student's password.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "current_password": "string",
  "new_password": "string",
  "confirm_password": "string"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

- `400`: Invalid request (missing fields, password mismatch, weak password, etc.)
- `404`: Student not found

**Validation Rules:**

- New password must be at least 6 characters long
- New password must be different from current password
- New password and confirm password must match
- Current password must be correct

**Example:**

```bash
curl -X PUT http://localhost:3000/api/student/change-password \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldpassword123",
    "new_password": "newpassword123",
    "confirm_password": "newpassword123"
  }'
```

## School Endpoints for Student Management

### 4. School Student Management

#### GET `/api/school/students`

Get all students for the authenticated school with pagination and search.

**Headers:**

```
Authorization: Bearer <school_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or student number

**Response (200):**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "string",
        "student_number": "string",
        "class": "string",
        "grade": "string",
        "address": "string",
        "gender": "string",
        "birth_date": "YYYY-MM-DD",
        "school_id": "uuid",
        "created_at": "ISO_DATE"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 50,
      "limit": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/school/students?page=1&limit=10&search=john" \
  -H "Authorization: Bearer <school_jwt_token>"
```

#### POST `/api/school/students`

Create a new student account for the authenticated school.

**Headers:**

```
Authorization: Bearer <school_jwt_token>
```

**Request Body:**

```json
{
  "name": "string",
  "student_number": "string",
  "password": "string",
  "class": "string",
  "grade": "string",
  "address": "string (optional)",
  "gender": "male|female (optional)",
  "birth_date": "YYYY-MM-DD (optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Student account created successfully",
  "data": {
    "student": {
      "id": "uuid",
      "name": "string",
      "student_number": "string",
      "class": "string",
      "grade": "string",
      "address": "string",
      "gender": "string",
      "birth_date": "YYYY-MM-DD",
      "school_id": "uuid",
      "created_at": "ISO_DATE"
    }
  }
}
```

**Error Responses:**

- `400`: Invalid request data
- `409`: Student number already exists

**Validation Rules:**

- Name, student_number, password, class, and grade are required
- Password must be at least 6 characters long
- Student number must be unique
- Gender must be "male" or "female" if provided
- Birth date must be in YYYY-MM-DD format if provided

**Example:**

```bash
curl -X POST http://localhost:3000/api/school/students \
  -H "Authorization: Bearer <school_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "student_number": "2024001",
    "password": "password123",
    "class": "XII IPA 1",
    "grade": "12",
    "address": "Jl. Pendidikan No. 123",
    "gender": "male",
    "birth_date": "2005-01-15"
  }'
```

## Authentication Comparison

### All Roles Use Consistent Format

**Government Login:**

```bash
curl -X POST http://localhost:3000/api/gov/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "province_id",
    "password": "password"
  }'
```

**School Login:**

```bash
curl -X POST http://localhost:3000/api/school/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "school_id",
    "password": "password"
  }'
```

**Student Login:**

```bash
curl -X POST http://localhost:3000/api/student/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "student_number",
    "password": "password"
  }'
```

All return the same response structure:

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "role": "government|school|student",
    "name": "string"
    // ... role-specific fields
  },
  "message": "Login successful"
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Data Types

### Student Object

```typescript
{
  id: string;           // UUID
  name: string;         // Full name
  student_number: string; // Unique identifier
  class: string;        // Class name (e.g., "XII IPA 1")
  grade: string;        // Grade level (e.g., "12")
  address?: string;     // Home address
  gender?: string;      // "male" or "female"
  birth_date?: string;  // YYYY-MM-DD format
  school_id: string;    // UUID of the school
  created_at: string;   // ISO date string
}
```

### Validation Rules

- **Password**: Minimum 6 characters
- **Date Format**: YYYY-MM-DD (ISO date format)
- **Gender**: Must be "male" or "female" (case insensitive)
- **Student Number**: Must be unique across the system
- **Required Fields**: Vary by endpoint, see individual documentation
