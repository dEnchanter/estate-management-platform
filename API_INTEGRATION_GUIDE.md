# API Integration Status & Gap Analysis

**Project:** Zamanni Community Management Platform
**Date:** 2025-11-07
**Status:** Development Phase

---

## Table of Contents

1. [Integrated Endpoints](#integrated-endpoints)
2. [Pages Without API Integration](#pages-without-api-integration)
3. [Missing Critical Endpoints](#missing-critical-endpoints)
4. [High Priority Items](#high-priority-missing-integrations)
5. [Implementation Recommendations](#implementation-recommendations)

---

## ✅ Integrated Endpoints

The following endpoints have been successfully integrated with React hooks and are ready to use:

### Authentication & User Management

| Endpoint | Method | Hook | Status | Notes |
|----------|--------|------|--------|-------|
| `/users/login` | POST | `useLogin()` | ✅ | Fully integrated in login page |
| `/users/register` | POST | `useRegister()` | ✅ | Available but not used in UI |
| `/users/set-password` | POST | `useSetPassword()` | ✅ | Available but not used in UI |
| `/users/approve-resident` | POST | `useApproveResident()` | ✅ | Available but not used in UI |
| `/users/new-user` | POST | `useCreateUserWithRole()` | ✅ | Integrated in users page |
| `/users/admin-roles` | GET | `useAdminRoles()` | ✅ | Used in create user dialog |
| `/residents/pending` | GET | `usePendingResidents()` | ✅ | Integrated in users page |
| `/users/check-username` | POST | `useCheckUsername()` | ✅ | Available but not used in UI |

### Communities

| Endpoint | Method | Hook | Status | Notes |
|----------|--------|------|--------|-------|
| `/communities` | GET | `useCommunities()` | ✅ | Integrated in communities page |
| `/communities/new` | POST | `useCreateCommunity()` | ✅ | Integrated with logo upload |

### Access Codes

| Endpoint | Method | Hook | Status | Notes |
|----------|--------|------|--------|-------|
| `/resident/access-codes/active` | GET | `useActiveAccessCodes()` | ✅ | Fully integrated |
| `/resident/access/generate-code` | POST | `useGenerateAccessCode()` | ✅ | Fully integrated |
| `/resident/access-codes/{code}/cancel` | GET | `useCancelAccessCode()` | ✅ | Fully integrated |
| `/access/{code}/validate` | GET | `useValidateAccessCode()` | ✅ | Fully integrated |
| `/access/generate-codes` | POST | `useGenerateBulkCodes()` | ✅ | Fully integrated |

### Wallets

| Endpoint | Method | Hook | Status | Notes |
|----------|--------|------|--------|-------|
| `/wallets` | GET | `useWallets()` | ⚠️ | Hook exists, not used in UI |
| `/wallets/{name}/wallet-by-profile` | PUT | `useCreateWalletByProfile()` | ⚠️ | Hook exists, not used in UI |

### Dues/Collections

| Endpoint | Method | Hook | Status | Notes |
|----------|--------|------|--------|-------|
| `/community/due-categories` | GET | `useDueCategories()` | ⚠️ | Hook exists, not used in UI |
| `/community/dues` | GET | `useCommunityDues()` | ⚠️ | Hook exists, not used in UI |
| `/resident/dues` | GET | `useResidentDues()` | ⚠️ | Hook exists, not used in UI |
| `/community/new-due` | POST | `useCreateDue()` | ⚠️ | Hook exists, not used in UI |
| `/resident/pay_due` | POST | `usePayDue()` | ⚠️ | Hook exists, not used in UI |
| `/config/create-due-profiles` | GET | `useDueChargeProfiles()` | ⚠️ | Hook exists, not used in UI |
| `/config/create-due-profile` | POST | `useCreateDueChargeProfile()` | ⚠️ | Hook exists, not used in UI |
| `/config/update-due-profile` | PUT | `useUpdateDueChargeProfile()` | ⚠️ | Hook exists, not used in UI |
| `/config/due-profile/{id}/status` | PATCH | `useToggleDueProfileStatus()` | ⚠️ | Hook exists, not used in UI |

### Services/Utilities

| Endpoint | Method | Hook | Status | Notes |
|----------|--------|------|--------|-------|
| `/config/utilities` | GET | `useServices()` | ⚠️ | Hook exists, not used in UI |
| `/resident/services` | GET | `useResidentServices()` | ⚠️ | Hook exists, not used in UI |
| `/config/utilities` | POST | `useCreateOrUpdateService()` | ⚠️ | Hook exists, supports logo upload |
| `/config/utility-products` | GET | `useServiceProducts()` | ⚠️ | Hook exists, not used in UI |
| `/config/utility-products` | POST | `useCreateOrUpdateServiceProduct()` | ⚠️ | Hook exists, not used in UI |
| `/config/service-charges` | GET | `useServiceCharges()` | ⚠️ | Hook exists, not used in UI |
| `/config/service-charges` | POST | `useCreateOrUpdateServiceCharge()` | ⚠️ | Hook exists, not used in UI |
| `/config/product-charges` | GET | `useProductCharges()` | ⚠️ | Hook exists, not used in UI |
| `/config/product-charges` | POST | `useCreateOrUpdateProductCharge()` | ⚠️ | Hook exists, not used in UI |
| `/config/service-communities` | GET | `useServiceCommunities()` | ⚠️ | Hook exists, not used in UI |
| `/config/utility-communities` | POST | `useMapServiceToCommunity()` | ⚠️ | Hook exists, not used in UI |
| `/resident/vas/pay` | POST | `useMakeVasPayment()` | ⚠️ | Hook exists, not used in UI |

---

## ❌ Pages Without API Integration

These pages exist in the UI but are using mock/hardcoded data:

### 1. Dashboard (`/dashboard`)

**Current State:** Shows hardcoded statistics and mock data

**Missing Endpoints:**

```typescript
// Dashboard Statistics
GET /dashboard/stats
Response: {
  "totalUsers": 480,
  "totalCommunities": 16,
  "totalAdmins": 8,
  "totalRevenue": "₦12,350,000"
}

// Recent Communities
GET /dashboard/recent-communities
Response: {
  "data": [{
    "id": "string",
    "name": "string",
    "address": "string",
    "admin": "string",
    "residents": number,
    "createdAt": "ISO date"
  }]
}

// Collection Summaries
GET /dashboard/collections
Response: {
  "data": [{
    "category": "Electricity|Water|Internet|etc",
    "totalCollected": number,
    "pendingPayments": number
  }]
}
```

---

### 2. Admins (`/admins`)

**Current State:** Using mock admin data

**Missing Endpoints:**

```typescript
// Get All Admins
GET /admins
Query Params: ?type=Operations|Security|Finance&status=Active|Inactive
Response: {
  "data": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "username": "string",
    "type": "Operations|Security|Finance",
    "status": "Active|Inactive",
    "createdAt": "ISO date"
  }]
}

// Create Admin
POST /admins
Request: {
  "name": "string",
  "email": "string",
  "phone": "string",
  "username": "string",
  "type": "Operations|Security|Finance",
  "password": "string"
}

// Update Admin
PUT /admins/{id}
Request: {
  "name": "string",
  "email": "string",
  "phone": "string",
  "type": "Operations|Security|Finance"
}

// Delete Admin
DELETE /admins/{id}

// Toggle Admin Status
PATCH /admins/{id}/status
Request: {
  "status": "Active|Inactive"
}
```

---

### 3. Wallet (`/wallet`)

**Current State:** Shows mock wallet cards

**Missing Endpoints:**

```typescript
// Get Wallet Transactions
GET /wallets/{id}/transactions
Query Params: ?startDate=&endDate=&type=credit|debit&limit=50&offset=0
Response: {
  "data": [{
    "id": "string",
    "type": "credit|debit",
    "amount": number,
    "description": "string",
    "reference": "string",
    "balanceBefore": number,
    "balanceAfter": number,
    "date": "ISO date",
    "status": "pending|completed|failed"
  }],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number
  }
}

// Transfer Between Wallets
POST /wallets/transfer
Request: {
  "fromWalletId": "string",
  "toWalletId": "string",
  "amount": number,
  "description": "string",
  "pin": "string"
}

// Fund Wallet
POST /wallets/fund
Request: {
  "walletId": "string",
  "amount": number,
  "paymentMethod": "card|bank_transfer|cash",
  "reference": "string"
}

// Withdraw from Wallet
POST /wallets/withdraw
Request: {
  "walletId": "string",
  "amount": number,
  "bankAccount": {
    "accountNumber": "string",
    "bankCode": "string"
  },
  "pin": "string"
}

// Get Wallet Balance
GET /wallets/{id}/balance
Response: {
  "walletId": "string",
  "availableBalance": number,
  "ledgerBalance": number,
  "currency": "NGN"
}
```

---

### 4. Utilities (`/utilities`)

**Current State:** Shows hardcoded utility cards (Electricity, Water, Internet, etc.)

**Status:** Hooks exist but page not integrated

**Required Action:** Integrate existing hooks:
- `useServices()` - Get all utilities
- `useResidentServices()` - Get utilities available to resident
- `useCreateOrUpdateService()` - Create/update utility

---

### 5. Collections (No Dedicated Page)

**Current State:** Collection data shown in utilities but no management page

**Missing Endpoints:**

```typescript
// Get All Collections
GET /collections
Query Params: ?category=&status=active|archived&communityId=
Response: {
  "data": [{
    "id": "string",
    "category": "string",
    "description": "string",
    "amount": number,
    "frequency": "one-time|monthly|quarterly|yearly",
    "dueDate": "ISO date",
    "totalPaid": number,
    "totalPending": number,
    "status": "active|archived"
  }]
}

// Get Collection Payments
GET /collections/{id}/payments
Response: {
  "data": [{
    "id": "string",
    "residentId": "string",
    "residentName": "string",
    "amount": number,
    "status": "paid|pending|overdue",
    "paidDate": "ISO date",
    "dueDate": "ISO date"
  }]
}

// Get Collection Statistics
GET /collections/stats
Response: {
  "totalCollections": number,
  "totalPaid": number,
  "totalPending": number,
  "totalOverdue": number,
  "categories": [{
    "category": "string",
    "amount": number,
    "paidPercentage": number
  }]
}
```

---

## 🔴 Missing Critical Endpoints

These are essential endpoints that don't exist in the current API documentation:

### 1. Audit Logs

**Status:** No page, no hooks, no API

**Required Endpoints:**

```typescript
// Get Audit Logs
GET /audit-logs
Query Params: ?startDate=&endDate=&userId=&action=&resource=&limit=50&offset=0
Response: {
  "data": [{
    "id": "string",
    "userId": "string",
    "userName": "string",
    "userEmail": "string",
    "action": "create|update|delete|login|logout|approve|reject",
    "resource": "user|community|access-code|wallet|due|service",
    "resourceId": "string",
    "details": {
      "before": {},
      "after": {}
    },
    "timestamp": "ISO date",
    "ipAddress": "string",
    "userAgent": "string",
    "status": "success|failure"
  }],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number
  }
}

// Get Audit Log Details
GET /audit-logs/{id}
Response: {
  "id": "string",
  "userId": "string",
  "userName": "string",
  "userEmail": "string",
  "action": "string",
  "resource": "string",
  "resourceId": "string",
  "details": {
    "before": {},
    "after": {},
    "metadata": {}
  },
  "timestamp": "ISO date",
  "ipAddress": "string",
  "userAgent": "string",
  "status": "success|failure",
  "errorMessage": "string"
}
```

---

### 2. User Details & Management

**Status:** Detail pages exist but no API integration

**Required Endpoints:**

```typescript
// Get User Details
GET /users/{id}
Response: {
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "username": "string",
  "profileType": "Resident|Developer|Community|System",
  "communityId": "string",
  "communityName": "string",
  "categoryName": "string",
  "status": "active|inactive|pending",
  "address": {},
  "createdAt": "ISO date",
  "lastLogin": "ISO date"
}

// Update User
PUT /users/{id}
Request: {
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": {}
}

// Delete/Deactivate User
DELETE /users/{id}

// Get All Residents (not just pending)
GET /residents
Query Params: ?communityId=&status=active|inactive&categoryId=
Response: {
  "data": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "username": "string",
    "communityName": "string",
    "categoryName": "string",
    "status": "active|inactive"
  }]
}

// Get Resident Details
GET /residents/{id}
Response: {
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "username": "string",
  "communityId": "string",
  "communityName": "string",
  "categoryId": "string",
  "categoryName": "string",
  "address": {},
  "status": "active|inactive",
  "joinedDate": "ISO date",
  "totalPayments": number,
  "totalDues": number,
  "activeDues": number
}

// Get Resident's Access Codes
GET /residents/{id}/access-codes
Response: {
  "data": [{
    "code": "string",
    "category": "string",
    "status": "Open|Used|Cancelled",
    "generatedAt": "ISO date",
    "expiresAt": "ISO date"
  }]
}

// Get Resident's Payment History
GET /residents/{id}/payments
Response: {
  "data": [{
    "id": "string",
    "type": "due|service|utility",
    "description": "string",
    "amount": number,
    "date": "ISO date",
    "status": "completed|pending|failed"
  }]
}
```

---

### 3. Community Details & Management

**Status:** Detail pages exist but no API integration

**Required Endpoints:**

```typescript
// Get Community Details
GET /communities/{id}
Response: {
  "id": "string",
  "name": "string",
  "communityCode": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "zipCode": "string"
  },
  "logoUrl": "string",
  "adminId": "string",
  "adminName": "string",
  "totalResidents": number,
  "activeResidents": number,
  "totalDues": number,
  "totalCollections": number,
  "createdAt": "ISO date"
}

// Update Community
PUT /communities/{id}
Request: FormData {
  "name": "string",
  "address": JSON string,
  "logo": File (optional)
}

// Delete Community
DELETE /communities/{id}

// Get Community Residents
GET /communities/{id}/residents
Query Params: ?status=active|inactive&categoryId=
Response: {
  "data": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "categoryName": "string",
    "status": "active|inactive",
    "joinedDate": "ISO date"
  }]
}

// Get Community Admins
GET /communities/{id}/admins
Response: {
  "data": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "Community Admin|Community Security|Community Manager",
    "status": "active|inactive"
  }]
}

// Get Community Categories
GET /communities/{id}/categories
Response: {
  "data": [{
    "id": "string",
    "name": "string",
    "description": "string",
    "residentCount": number
  }]
}

// Create Community Category
POST /communities/{id}/categories
Request: {
  "name": "string",
  "description": "string"
}
```

---

### 4. Notifications

**Status:** No endpoint, no hook, no UI

**Required Endpoints:**

```typescript
// Get User Notifications
GET /notifications
Query Params: ?read=true|false&limit=20&offset=0
Response: {
  "data": [{
    "id": "string",
    "title": "string",
    "message": "string",
    "type": "info|warning|error|success",
    "category": "due|access-code|payment|system",
    "read": boolean,
    "createdAt": "ISO date",
    "actionUrl": "string"
  }],
  "unreadCount": number
}

// Mark Notification as Read
PATCH /notifications/{id}/read

// Mark All Notifications as Read
PATCH /notifications/read-all

// Delete Notification
DELETE /notifications/{id}
```

---

### 5. Reports & Analytics

**Status:** No endpoint, no hook, no UI

**Required Endpoints:**

```typescript
// Financial Report
GET /reports/financial
Query Params: ?startDate=&endDate=&communityId=&type=summary|detailed
Response: {
  "period": {
    "startDate": "ISO date",
    "endDate": "ISO date"
  },
  "summary": {
    "totalRevenue": number,
    "totalDuesCollected": number,
    "totalServicePayments": number,
    "totalWalletTransactions": number
  },
  "breakdown": [{
    "category": "string",
    "amount": number,
    "percentage": number
  }]
}

// Collection Report
GET /reports/collections
Query Params: ?startDate=&endDate=&communityId=&category=
Response: {
  "summary": {
    "totalCollections": number,
    "totalPaid": number,
    "totalPending": number,
    "collectionRate": number
  },
  "collections": [{
    "category": "string",
    "totalAmount": number,
    "paidAmount": number,
    "pendingAmount": number,
    "numberOfPayments": number
  }]
}

// Resident Report
GET /reports/residents
Query Params: ?communityId=&status=active|inactive
Response: {
  "summary": {
    "totalResidents": number,
    "activeResidents": number,
    "inactiveResidents": number,
    "newResidentsThisMonth": number
  },
  "categories": [{
    "categoryName": "string",
    "count": number,
    "percentage": number
  }]
}

// Access Code Usage Report
GET /reports/access-codes
Query Params: ?startDate=&endDate=&communityId=&category=
Response: {
  "summary": {
    "totalGenerated": number,
    "totalUsed": number,
    "totalCancelled": number,
    "totalActive": number
  },
  "categories": [{
    "category": "Visitor|Service Provider|Delivery|Guest",
    "generated": number,
    "used": number,
    "usageRate": number
  }]
}
```

---

### 6. Community Settings

**Status:** No endpoint, no hook, no UI

**Required Endpoints:**

```typescript
// Get Community Settings
GET /communities/{id}/settings
Response: {
  "communityId": "string",
  "general": {
    "allowResidentRegistration": boolean,
    "requireAdminApproval": boolean,
    "accessCodeExpiry": number // hours
  },
  "dues": {
    "autoGenerateDues": boolean,
    "dueReminderDays": number,
    "lateFeePercentage": number
  },
  "access": {
    "maxActiveCodesPerResident": number,
    "defaultCodeValidity": number // hours
  }
}

// Update Community Settings
PUT /communities/{id}/settings
Request: {
  "general": {},
  "dues": {},
  "access": {}
}
```

---

## 🔴 High Priority Missing Integrations

### Priority 1 (Critical)
1. **Dashboard Stats API** - Admin overview is essential
2. **Audit Logs** - Required for compliance, security, and debugging
3. **Admin Management CRUD** - Currently using mock data

### Priority 2 (High)
4. **User/Community Detail Pages** - CRUD operations incomplete
5. **Wallet Transactions** - Can see wallets but not transaction history
6. **Resident Management** - Only pending residents, need full CRUD

### Priority 3 (Medium)
7. **Notifications System** - No notification infrastructure
8. **Collections Management** - Hooks exist but no dedicated page
9. **Utilities Integration** - Hooks exist but page not integrated

### Priority 4 (Low)
10. **Reports/Analytics** - Nice-to-have for insights
11. **Community Settings** - Can be added later

---

## 📊 Implementation Recommendations

### Immediate Actions

#### 1. Integrate Existing Hooks (Quick Wins)
These hooks already exist and just need UI integration:

**Utilities Page** (`/utilities`)
```typescript
// File: src/app/(dashboard)/utilities/page.tsx
import { useServices } from '@/hooks/use-services';

// Replace mock data with:
const { data: services, isLoading } = useServices();
```

**Wallet Page** (`/wallet`)
```typescript
// File: src/app/(dashboard)/wallet/page.tsx
import { useWallets } from '@/hooks/use-wallets';

// Replace mock data with:
const { data: wallets, isLoading } = useWallets();
```

**Collections Integration**
- Create dedicated `/collections` page
- Use existing `useCommunityDues()`, `useResidentDues()` hooks
- Add payment dialogs using `usePayDue()`

---

#### 2. Request Missing Critical Endpoints from Backend

**Provide this list to backend team:**

```markdown
## Priority 1 - Dashboard
- GET /dashboard/stats
- GET /dashboard/recent-communities
- GET /dashboard/collections

## Priority 2 - Audit Logs
- GET /audit-logs
- GET /audit-logs/{id}

## Priority 3 - Admin Management
- GET /admins
- POST /admins
- PUT /admins/{id}
- DELETE /admins/{id}
- PATCH /admins/{id}/status

## Priority 4 - Details & CRUD
- GET /users/{id}
- PUT /users/{id}
- DELETE /users/{id}
- GET /communities/{id}
- PUT /communities/{id}
- DELETE /communities/{id}
- GET /residents
- GET /residents/{id}

## Priority 5 - Wallet Transactions
- GET /wallets/{id}/transactions
- POST /wallets/transfer
- POST /wallets/fund
- POST /wallets/withdraw
```

---

#### 3. Create Missing Pages

**Audit Logs Page**
```bash
# File structure
src/
  app/(dashboard)/audit-logs/
    page.tsx
  components/audit-logs/
    audit-log-data-table.tsx
  hooks/
    use-audit-logs.ts
```

**Collections Page**
```bash
# File structure
src/
  app/(dashboard)/collections/
    page.tsx
  components/collections/
    collection-data-table.tsx
    payment-dialog.tsx
```

---

### Testing Checklist

- [ ] All access code endpoints working
- [ ] Communities CRUD working
- [ ] User creation working
- [ ] Pending residents display working
- [ ] Dashboard shows real data
- [ ] Admins CRUD working
- [ ] Wallets display working
- [ ] Wallet transactions working
- [ ] Utilities display working
- [ ] Collections management working
- [ ] Audit logs working
- [ ] Notifications working
- [ ] Reports working

---

## 📈 Current Integration Status

| Category | Hooks Created | UI Integrated | Percentage |
|----------|---------------|---------------|------------|
| Authentication | 8 | 4 | 50% |
| Communities | 2 | 2 | 100% |
| Access Codes | 5 | 5 | 100% |
| Wallets | 3 | 0 | 0% |
| Dues | 9 | 0 | 0% |
| Services | 12 | 0 | 0% |
| Dashboard | 0 | 0 | 0% |
| Admins | 0 | 0 | 0% |
| Audit Logs | 0 | 0 | 0% |
| Notifications | 0 | 0 | 0% |
| Reports | 0 | 0 | 0% |
| **Overall** | **39** | **11** | **28%** |

---

## 🎯 Next Steps

1. **Week 1:** Integrate existing hooks (Wallets, Utilities, Collections)
2. **Week 2:** Request & implement Dashboard stats API
3. **Week 3:** Implement Audit Logs (full stack)
4. **Week 4:** Implement Admin Management CRUD
5. **Week 5:** Complete User/Community detail pages
6. **Week 6:** Add Notifications system
7. **Week 7:** Implement Reports & Analytics

---

## 📞 Contact

For questions about this integration guide, contact the development team.

**Last Updated:** 2025-11-07
