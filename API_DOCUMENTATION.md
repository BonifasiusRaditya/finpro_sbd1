# MBGku API Documentation

## Authentication System

The MBGku API uses JWT (JSON Web Tokens) for authentication with hierarchical role-based access control. There are three user roles with different permission levels:

- **Government** (Level 3): Provincial government accounts with highest access - can manage all schools and students in their province
- **School** (Level 2): School accounts that can manage their own students and meal distribution
- **Student** (Level 1): Student accounts that can only access their own data and claim meals

### Hierarchical Permission System

The API implements a hierarchical permission system where higher-level roles automatically have access to lower-level resources:

- **Government** can access all school and student endpoints
- **School** can access all student endpoints for their school
- **Student** can only access their own data

This means:

- Government users don't need to be explicitly granted school permissions
- School users don't need to be explicitly granted student permissions
- The system automatically applies appropriate data filtering based on user role

### JWT Token Structure

All JWT tokens include:

- `id`: User's unique identifier
- `role`: User role (government/school/student)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

Role-specific additional fields:

- **Government**: `province_id`, `province`
- **School**: `school_id`, `npsn`, `name`, `government_id`
- **Student**: `student_number`, `name`, `class`, `grade`, `school_id`

### Authentication Headers

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Government Authentication

#### POST `/api/gov/auth/login`

Login for government accounts.

**Request Body:**

```json
{
  "identifier": "province_id",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "role": "government",
    "name": "Province Name",
    "province_id": "province_id",
    "province": "Province Name",
    "contact_name": "Contact Person",
    "contact_email": "email@example.com",
    "contact_phone": "phone_number",
    "address": "address"
  },
  "message": "Login successful"
}
```

### School Management (Government Only)

#### POST `/api/gov/schools`

Create a new school account. Requires government authentication.

**Headers:**

```
Authorization: Bearer <government-jwt-token>
```

**Request Body:**

```json
{
  "name": "School Name",
  "npsn": "12345678",
  "school_id": "unique_school_id",
  "password": "school_password",
  "address": "School Address (optional)",
  "contact_person": "Contact Person (optional)",
  "contact_email": "email@school.com (optional)",
  "contact_phone": "phone_number (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "School created successfully",
  "data": {
    "id": "uuid",
    "name": "School Name",
    "npsn": "12345678",
    "school_id": "unique_school_id",
    "address": "School Address",
    "contact_person": "Contact Person",
    "contact_email": "email@school.com",
    "contact_phone": "phone_number",
    "government_id": "government_uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules:**

- `name`, `npsn`, `school_id`, `password` are required
- `npsn` must be exactly 8 digits
- `password` must be at least 6 characters
- `school_id` and `npsn` must be unique

#### GET `/api/gov/schools`

Get all schools under the authenticated government. Requires government authentication.

**Headers:**

```
Authorization: Bearer <government-jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Schools retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "School Name",
      "npsn": "12345678",
      "school_id": "unique_school_id",
      "address": "School Address",
      "contact_person": "Contact Person",
      "contact_email": "email@school.com",
      "contact_phone": "phone_number",
      "government_id": "government_uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### School Authentication

#### POST `/api/school/auth/login`

Login for school accounts.

**Request Body:**

```json
{
  "identifier": "school_id",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "role": "school",
    "name": "School Name",
    "school_id": "school_id",
    "npsn": "12345678",
    "address": "School Address",
    "contact_person": "Contact Person",
    "contact_email": "email@school.com",
    "contact_phone": "phone_number",
    "government_id": "government_uuid"
  },
  "message": "Login successful"
}
```

### School Self-Management

#### GET `/api/school`

Get school's own data. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "School data retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "School Name",
    "npsn": "12345678",
    "school_id": "unique_school_id",
    "address": "School Address",
    "contact_person": "Contact Person",
    "contact_email": "email@school.com",
    "contact_phone": "phone_number",
    "government_id": "government_uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/school/profile`

Get school profile (same as `/api/school`). Requires school authentication.

#### PUT `/api/school/profile`

Update school profile. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Request Body:**

```json
{
  "name": "Updated School Name (optional)",
  "address": "Updated Address (optional)",
  "contact_person": "Updated Contact Person (optional)",
  "contact_email": "updated@email.com (optional)",
  "contact_phone": "updated_phone (optional)",
  "password": "new_password (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "School profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated School Name",
    "npsn": "12345678",
    "school_id": "unique_school_id",
    "address": "Updated Address",
    "contact_person": "Updated Contact Person",
    "contact_email": "updated@email.com",
    "contact_phone": "updated_phone",
    "government_id": "government_uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/school/settings`

Get school settings (same as profile). Requires school authentication.

#### PUT `/api/school/settings`

Update school settings (same as profile update). Requires school authentication.

#### PUT `/api/school/change-password`

Change school password with current password verification. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Request Body:**

```json
{
  "current_password": "current_password",
  "new_password": "new_password",
  "confirm_password": "new_password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Validation Rules:**

- All fields are required
- `new_password` and `confirm_password` must match
- `new_password` must be at least 6 characters
- `current_password` must be correct

#### GET `/api/school/dashboard`

Get school dashboard data with statistics. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "school": {
      "id": "uuid",
      "name": "School Name",
      "npsn": "12345678",
      "school_id": "unique_school_id"
    },
    "statistics": {
      "total_students": 150,
      "active_menus": 5,
      "meals_today": 45,
      "meals_this_week": 320,
      "meals_this_month": 1250
    },
    "last_updated": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET `/api/school/students`

Get list of students in the school with pagination and search. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or student_number

**Response:**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "Student Name",
        "student_number": "student_number",
        "class": "5A",
        "grade": 5,
        "address": "Student Address",
        "gender": "Laki-laki",
        "birth_date": "2010-01-01"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 15,
      "total_count": 150,
      "limit": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET `/api/school/menus`

Get list of menus allocated to the school. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "message": "School menus retrieved successfully",
  "data": {
    "menus": [
      {
        "id": "uuid",
        "name": "Menu Name",
        "description": "Menu Description",
        "date": "2024-01-01",
        "price_per_portion": 15000,
        "allocated_quantity": 100,
        "allocation_date": "2024-01-01"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 5,
      "limit": 10,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

#### GET `/api/school/meal-logs`

Get meal distribution history with pagination and date filtering. Requires school authentication.

**Headers:**

```
Authorization: Bearer <school-jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "message": "Meal logs retrieved successfully",
  "data": {
    "meal_logs": [
      {
        "id": "uuid",
        "user_id": "student_uuid",
        "menu_id": "menu_uuid",
        "student_name": "Student Name",
        "student_number": "student_number",
        "menu_name": "Menu Name",
        "menu_description": "Menu Description",
        "distributed_at": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 125,
      "total_count": 1250,
      "limit": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgres://username:password@hostname:5432/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Testing the API

You can test the API using tools like Postman, curl, or any HTTP client.

Example curl command for government login:

```bash
curl -X POST http://localhost:3000/api/gov/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "province_id", "password": "password"}'
```

Example curl command for creating a school:

```bash
curl -X POST http://localhost:3000/api/gov/schools \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Test School",
    "npsn": "12345678",
    "school_id": "test_school_001",
    "password": "school123",
    "address": "Test Address"
  }'
```

Example curl command for creating a menu:

```bash
curl -X POST http://localhost:3000/api/gov/menus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <government-jwt-token>" \
  -d '{
    "name": "Nasi Gudeg + Ayam + Sayur Bayam",
    "description": "Menu bergizi dengan protein dan sayuran",
    "date": "2024-01-15",
    "price_per_portion": 15000
  }'
```

Example curl command for allocating a menu to a school:

```bash
curl -X POST http://localhost:3000/api/gov/menu-allocations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <government-jwt-token>" \
  -d '{
    "school_id": "school-uuid",
    "menu_id": "menu-uuid",
    "quantity": 150,
    "date": "2024-01-15"
  }'
```

## Menu Management (Government Only)

### Menu CRUD Operations

#### POST `/api/gov/menus`

Create a new menu for a specific date. Requires government authentication.

**Headers:**

```
Authorization: Bearer <government-jwt-token>
```

**Request Body:**

```json
{
  "name": "Nasi Gudeg + Ayam + Sayur Bayam",
  "description": "Menu bergizi dengan protein dan sayuran (optional)",
  "date": "2024-01-15",
  "price_per_portion": 15000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Menu created successfully",
  "data": {
    "id": "uuid",
    "name": "Nasi Gudeg + Ayam + Sayur Bayam",
    "description": "Menu bergizi dengan protein dan sayuran",
    "date": "2024-01-15",
    "price_per_portion": 15000,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules:**

- `name`, `date`, `price_per_portion` are required
- `date` must be in YYYY-MM-DD format and not in the past
- `price_per_portion` must be a positive number

#### GET `/api/gov/menus`

Get all menus with pagination and date filtering. Requires government authentication.

**Headers:**

```
Authorization: Bearer <government-jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "message": "Menus retrieved successfully",
  "data": {
    "menus": [
      {
        "id": "uuid",
        "name": "Nasi Gudeg + Ayam + Sayur Bayam",
        "description": "Menu bergizi dengan protein dan sayuran",
        "date": "2024-01-15",
        "price_per_portion": 15000,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
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

#### GET `/api/gov/menus/[id]`

Get a specific menu by ID. Requires government authentication.

#### PUT `/api/gov/menus/[id]`

Update a specific menu. Requires government authentication.

**Request Body:** Same as POST but all fields are optional.

#### DELETE `/api/gov/menus/[id]`

Delete a specific menu. Requires government authentication.

### Menu Allocation to Schools

#### POST `/api/gov/menu-allocations`

Allocate a menu to a school with specific quantity and date. Requires government authentication.

**Headers:**

```
Authorization: Bearer <government-jwt-token>
```

**Request Body:**

```json
{
  "school_id": "school-uuid",
  "menu_id": "menu-uuid",
  "quantity": 150,
  "date": "2024-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Menu allocated to school successfully",
  "data": {
    "id": "allocation-uuid",
    "school_id": "school-uuid",
    "menu_id": "menu-uuid",
    "quantity": 150,
    "date": "2024-01-15",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "menu": {
      "id": "menu-uuid",
      "name": "Nasi Gudeg + Ayam + Sayur Bayam",
      "description": "Menu bergizi dengan protein dan sayuran",
      "date": "2024-01-15",
      "price_per_portion": 15000
    },
    "school": {
      "id": "school-uuid",
      "name": "SD Negeri 1 Jakarta",
      "npsn": "12345678",
      "school_id": "school_001"
    }
  }
}
```

**Validation Rules:**

- All fields are required
- `school_id` must be a valid school under the government's province
- `menu_id` must be a valid menu
- `quantity` must be a positive number
- `date` must be in YYYY-MM-DD format and not in the past
- Cannot allocate the same menu to the same school on the same date

#### GET `/api/gov/menu-allocations`

Get all menu allocations for schools under the government. Requires government authentication.

**Headers:**

```
Authorization: Bearer <government-jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "message": "Menu allocations retrieved successfully",
  "data": {
    "allocations": [
      {
        "id": "allocation-uuid",
        "school_id": "school-uuid",
        "menu_id": "menu-uuid",
        "quantity": 150,
        "date": "2024-01-15",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "menu": {
          "id": "menu-uuid",
          "name": "Nasi Gudeg + Ayam + Sayur Bayam",
          "description": "Menu bergizi dengan protein dan sayuran",
          "date": "2024-01-15",
          "price_per_portion": 15000
        },
        "school": {
          "id": "school-uuid",
          "name": "SD Negeri 1 Jakarta",
          "npsn": "12345678",
          "school_id": "school_001"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 100,
      "limit": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET `/api/gov/menu-allocations/[id]`

Get a specific menu allocation by ID. Requires government authentication.

#### PUT `/api/gov/menu-allocations/[id]`

Update a specific menu allocation (quantity and/or date). Requires government authentication.

**Request Body:**

```json
{
  "quantity": 200,
  "date": "2024-01-16"
}
```

#### DELETE `/api/gov/menu-allocations/[id]`

Delete a specific menu allocation. Requires government authentication.

## Complete School CRUD Operations

### Government School Management

- `POST /api/gov/schools` - Create school
- `GET /api/gov/schools` - List all schools under government
- `GET /api/gov/schools/[id]` - Get specific school by ID
- `PUT /api/gov/schools/[id]` - Update specific school
- `DELETE /api/gov/schools/[id]` - Delete specific school

### School Self-Management

- `POST /api/school/auth/login` - School login
- `GET /api/school/profile` - Get own profile
- `PUT /api/school/profile` - Update own profile

All school management endpoints include proper authentication, authorization, validation, and error handling.
