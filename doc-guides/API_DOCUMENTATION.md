# Zamanni Estate Management API Documentation

**Base URL:** `http://13.61.25.196:8080/api`
**Version:** 1.0

## Table of Contents

- [Authentication](#authentication)
- [Communities](#communities)
- [Users & Residents](#users--residents)
- [Access Codes & Rules](#access-codes--rules)
- [Dues & Payments](#dues--payments)
- [Services & Utilities](#services--utilities)
- [Wallets](#wallets)
- [Partners](#partners)
- [Streets](#streets)
- [Configuration](#configuration)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Login

**POST** `/login`

Authenticate user and receive JWT token with profile information.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user_id": "string",
  "userType": "string",
  "profile": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "username": "string",
    "profileType": "Developer or Resident",
    "communityName": "string",
    "communityCode": "string",
    "communityLogo": "string",
    "categoryName": "string",
    "address": {},
    "account": {
      "account": "string",
      "accountName": "string",
      "bank": "string",
      "ledgerBalance": 0,
      "availableBalance": 0
    }
  }
}
```

---

## Communities

### Get All Communities

**GET** `/community/communities`

Retrieve a list of all communities in the system.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "myCommunityID": "string",
    "logoUrl": "string",
    "address": {},
    "userID": "string",
    "message": "string"
  }
]
```

### Create New Community

**POST** `/community/new-community`

Creates a community and assigns a community admin. Uploads logo file to cloud storage.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `payload` (required): JSON string containing community and user details
- `logo` (required): Logo file for the community

**Payload Structure:**
```json
{
  "name": "string",
  "address": {
    "country": "string",
    "state": "string",
    "lga": "string",
    "zipCode": "string",
    "street": "string"
  },
  "admin": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "username": "string"
  }
}
```

### Get Community QR Code

**GET** `/community/{id}/qrcode`

Returns the QR code and profile information for a community.

**Parameters:**
- `id` (path): Community ID (UUID)

**Response:**
```json
{
  "message": "string",
  "name": "string",
  "myCommunityID": "string",
  "logoUrl": "string",
  "address": {},
  "qrCode": "base64 encoded image string"
}
```

### Get Community Categories

**GET** `/community/categories`
🔒 **Requires Authentication**

Returns all active resident categories for a given community.

**Parameters:**
- `id` (path): Community ID (UUID)

---

## Users & Residents

### Register New User

**POST** `/register`

Self-registration for residents or developers. Requires approval before activation.

**Request Body:**
```json
{
  "username": "string (min 4 chars)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "myCommunityID": "string",
  "street": "string",
  "number": "string",
  "type": "Resident | Developer",
  "gender": "Male | Female",
  "movedIn": "2025-07-15T00:00:00Z"
}
```

### Get Pending Residents

**GET** `/residents/pending`

List all residents awaiting approval.

### Approve Resident

**POST** `/users/approve`

Activates a resident or developer, generates default password, and sends login credentials.

**Request Body:**
```json
{
  "residentID": "string",
  "categoryID": "string"
}
```

### Create User with Role

**POST** `/users/new-user`

Create a user with a specific community role (e.g., Community Security, Admin).

**Request Body:**
```json
{
  "username": "string",
  "name": "string",
  "phone": "string",
  "email": "string",
  "roleName": "string (e.g., 'Community Security')"
}
```

### Set Password

**POST** `/users/set-password`

Allows a user to change their default password (used once after approval).

**Request Body:**
```json
{
  "username": "string",
  "oldPassword": "string",
  "newPassword": "string (min 6 chars)"
}
```

### Check Username Availability

**GET** `/users/{username}`

Check if a username already exists in the system.

### Get Admin Roles

**GET** `/users/admin-roles`

Retrieves roles based on the logged-in user's profile type (System or Community).

**Response:**
```json
{
  "roles": ["string"]
}
```

---

## Access Codes & Rules

### Create Access Rule

**POST** `/access/community-rules`

Create a new access rule for a community.

**Request Body:**
```json
{
  "myCommunityID": "string",
  "codeCategory": "string",
  "codeType": 0,
  "usageNumber": 1,
  "expirationType": "string",
  "expirationNumber": 1
}
```

### Generate Access Code (Resident)

**POST** `/resident/access/generate-code`

Resident generates an access code for visitors.

**Request Body:**
```json
{
  "residentID": "string",
  "codeCategory": "string",
  "details": {}
}
```

**Response:**
```json
{
  "code": "string",
  "message": "string"
}
```

### Get Active Access Codes

**GET** `/resident/access-codes/active`

Returns all active access codes based on user type (Resident, Community, or System).

### Cancel Access Code

**GET** `/resident/access-codes/{code}/cancel`
🔒 **Requires Authentication**

Resident cancels an access code. Only works if status is 'Open'.

### Validate Access Code

**GET** `/access/{code}/validate`
🔒 **Requires Authentication**

Community Security validates an access code assigned to a resident.

### Generate Bulk Codes (Partners)

**POST** `/access/generate-codes`

Generate multiple access codes for partners.

**Request Body:**
```json
{
  "code_type": 0,
  "count": 0
}
```

---

## Dues & Payments

### Get Due Categories

**GET** `/community/due-categories`

Get list of default due categories.

### Create Community Due

**POST** `/community/new-due`
🔒 **Requires Authentication**

Creates a due product (Service Charge, Recurring, or One Time) for a community.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "due_type": "string",
  "amount": 0,
  "recur_type": "string",
  "wallet": "string",
  "resident_category": "string"
}
```

### Get Community Dues

**GET** `/community/dues`
🔒 **Requires Authentication**

Returns all dues tied to the authenticated user's community.

### Get Resident Dues

**GET** `/resident/dues`
🔒 **Requires Authentication**

Fetch all due products in the resident's community with their last transaction.

### Pay Due

**POST** `/resident/pay_due`
🔒 **Requires Authentication**

Resident or developer makes a due payment to the community.

**Request Body:**
```json
{
  "product_id": "string",
  "pay_amount": 0,
  "period": 0,
  "request_ref": "string",
  "remarks": "string"
}
```

---

## Services & Utilities

### Get Resident Services

**GET** `/resident/services`
🔒 **Requires Authentication**

Returns all services available to the resident's community with active products and last transaction.

### Make VAS Payment

**POST** `/resident/vas/pay`
🔒 **Requires Authentication**

Make a VAS payment (airtime, data, utilities, etc.).

**Request Body:**
```json
{
  "service_id": "string",
  "service_product_id": "string",
  "amount": 0,
  "password": "string",
  "request_ref": "string",
  "lookup_param": "string"
}
```

---

## Wallets

### Get All Wallets

**GET** `/wallets`
🔒 **Requires Authentication**

Returns all wallets for users with the specified profile type (Community or System).

### Create Wallet by Profile

**PUT** `/wallets/{name}/wallet-by-profile`

Creates a wallet for a user based on their profile type.

**Parameters:**
- `name` (path): User name

---

## Partners

### Get All Partners

**GET** `/partners`

Returns all partners with wallet balances and user information.

### Create Partner

**POST** `/partners/create-partner`

Create a new partner in the system.

**Request Body:**
```json
{
  "name": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "address": {}
}
```

---

## Streets

### Create Street

**POST** `/streets`

Create a new street in a community.

**Request Body:**
```json
{
  "name": "string",
  "communityCode": "string"
}
```

### Get Community Streets

**GET** `/streets/community/{code}`

Retrieves all active streets using the community code.

**Parameters:**
- `code` (path): Community code (myCommunityID)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "communityID": "string",
    "isActive": true
  }
]
```

### Toggle Street Status

**PUT** `/streets/{id}/status/{action}`

Activate or deactivate a street.

**Parameters:**
- `id` (path): Street ID
- `action` (path): "activate" or "deactivate"

---

## Configuration

### Service Charges

#### Get All Service Charges

**GET** `/config/service-charges`
🔒 **Requires Authentication**

Retrieve all service charges with distribution details.

#### Create/Edit Service Charge

**POST** `/config/service-charges`
🔒 **Requires Authentication**

Create new or update existing service charge.

**Request Body:**
```json
{
  "id": "string (empty for create)",
  "service_id": "string",
  "community_id": "string",
  "fee": 0,
  "fee_type": "string",
  "min_amount": 0,
  "max_amount": 0,
  "is_active": true,
  "distributions": [
    {
      "id": "string",
      "distribution_type": "string",
      "amount": 0,
      "wallet_id": "string"
    }
  ]
}
```

### Product Charges

#### Get All Product Charges

**GET** `/config/product-charges`
🔒 **Requires Authentication**

#### Create/Edit Product Charge

**POST** `/config/product-charges`
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "id": "string",
  "product_id": "string",
  "fee": 0,
  "fee_type": "string",
  "min_amount": 0,
  "max_amount": 0,
  "is_active": true,
  "distributions": [
    {
      "id": "string",
      "distribution_type": "string",
      "amount": 0,
      "wallet_id": "string"
    }
  ]
}
```

### Integrations

#### Get All Integrations

**GET** `/config/integrations`
🔒 **Requires Authentication**

#### Create/Edit Integration

**POST** `/config/integrations`
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "id": "string",
  "name": "string",
  "method": "string",
  "description": "string"
}
```

### Utilities/Services

#### Get All Services

**GET** `/config/utilities`
🔒 **Requires Authentication**

Retrieve all services with wallet and integration details.

#### Create/Edit Service

**POST** `/config/utilities`
🔒 **Requires Authentication**

**Content-Type:** `multipart/form-data`

**Form Data:**
- `payload` (required): Service JSON payload
- `logo` (required): Logo file for the service

### Service Products

#### Get All Service Products

**GET** `/config/utility-products`
🔒 **Requires Authentication**

#### Create/Edit Service Product

**POST** `/config/utility-products`
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "id": "string",
  "service_id": "string",
  "name": "string",
  "label": "string",
  "description": "string",
  "amount": 0,
  "min_amount": 0,
  "max_amount": 0,
  "recurring_type": "string",
  "is_active": true
}
```

### Service Communities

#### Get All Service-Community Mappings

**GET** `/config/service-communities`
🔒 **Requires Authentication**

#### Map/Edit Service to Community

**POST** `/config/utility-communities`
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "id": "string",
  "service_id": "string",
  "community_id": "string",
  "is_active": true
}
```

### Due Charge Profiles

#### Get All Due Charge Profiles

**GET** `/config/create-due-profiles`
🔒 **Requires Authentication**

#### Create Due Charge Profile

**POST** `/config/create-due-profile`
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "id": "string",
  "name": "string",
  "community": "string",
  "category": "string",
  "distributions": [
    {
      "id": "string",
      "distribution_type": "string",
      "amount": 0,
      "wallet_id": "string"
    }
  ]
}
```

#### Update Due Charge Profile

**PUT** `/config/update-due-profile`
🔒 **Requires Authentication**

#### Toggle Due Profile Status

**PATCH** `/config/due-profile/{id}/status`
🔒 **Requires Authentication**

**Parameters:**
- `id` (path): Due Charge Profile ID (UUID)
- `status` (query): true (enable) or false (disable)

---

## Resident Features

### Dashboard

**GET** `/report/resident/dashboard`
🔒 **Requires Authentication**

Get resident dashboard data including:
- Wallet balance
- Occupant statistics
- 2 recent occupants
- 2 recent transactions
- 2 recent access codes

### Manage Occupants

**POST** `/resident/occupant`
🔒 **Requires Authentication**

Create or update a resident occupant.

**Request Body:**
```json
{
  "id": "string (empty = create, else update)",
  "name": "string",
  "relationship": "Spouse | FlatMate | Child | Partner | Employee",
  "live_in": true,
  "is_active": true
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**403 Forbidden (Login with password change required):**
```json
{
  "error": "string",
  "mustChangePassword": "true"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

1. All authenticated endpoints require a valid Bearer token
2. File uploads use `multipart/form-data` content type
3. Dates should be in ISO 8601 format: `2025-07-15T00:00:00Z`
4. IDs are typically UUIDs
5. Empty `id` fields in request bodies indicate creation; non-empty indicates update
6. Base URL: `http://13.61.25.196:8080/api`
