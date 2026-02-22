# Zamanni Community — New API Integration Guide

**Project:** Zamanni Community Management Platform
**Guide Author:** Dev Team
**Updated:** 2026-02-21
**API Base URL:** `http://16.171.32.5:8080/api` (`NEXT_PUBLIC_API_BASE_URL`)

---

## Table of Contents

1. [What Changed from the Old API](#1-what-changed-from-the-old-api)
2. [How the API Layer is Built](#2-how-the-api-layer-is-built)
3. [Authentication Flow](#3-authentication-flow)
4. [Complete Endpoint Reference](#4-complete-endpoint-reference)
   - [Authentication](#41-authentication)
   - [Communities](#42-communities)
   - [Access Codes & Rules](#43-access-codes--rules)
   - [Dues & Payments](#44-dues--payments)
   - [Services & Utilities](#45-services--utilities)
   - [Wallets](#46-wallets)
   - [Partners](#47-partners)
   - [Streets](#48-streets)
   - [Resident Self-Service](#49-resident-self-service)
   - [Configuration](#410-configuration)
5. [Standard Response Shape](#5-standard-response-shape)
6. [How to Wire a Hook to a Page](#6-how-to-wire-a-hook-to-a-page)
7. [New Features That Need UI](#7-new-features-that-need-ui)
8. [Integration Checklist](#8-integration-checklist)

---

## 1. What Changed from the Old API

The previous `API_INTEGRATION_GUIDE.md` was written against an older version of the backend.
The backend team has since shipped a new Postman collection called **"Estate Management API"**.
The hooks in `src/hooks/` have already been updated to match. Here is a summary of what moved:

| Area | Old Path | New Path | Notes |
|---|---|---|---|
| Login | `POST /users/login` | `POST /login` | Shorter, top-level route |
| Register | `POST /users/register` | `POST /register` | Shorter, top-level route |
| Approve resident | `POST /users/approve-resident` | `POST /users/approve` | Renamed |
| List communities | `GET /communities` | `GET /community/communities` | Moved under `/community/` namespace |
| Create community | `POST /communities/new` | `POST /community/new-community` | Moved under `/community/` namespace |
| Check username | `POST /users/check-username` | `GET /users/:username` | Changed from POST to GET, username is now a path param |
| Community categories | *(not in old guide)* | `GET /community/categories` | New endpoint |
| Community QR code | *(not in old guide)* | `GET /community/:id/qrcode` | New endpoint |
| Create category | *(not in old guide)* | `POST /community/new-collection` | New endpoint |
| Partners | *(not in old guide)* | `GET /partners` + `POST /partners/create-partner` | Entire new domain |
| Streets | *(not in old guide)* | `GET/POST/PUT /streets/…` | Entire new domain |
| Resident dashboard | *(not in old guide)* | `GET /report/resident/dashboard` | New endpoint |
| Occupants | *(not in old guide)* | `POST /resident/occupant` | New endpoint |
| Access rules | *(not in old guide)* | `POST /access/community-rules` | New endpoint |
| Integrations | *(not in old guide)* | `GET/POST /config/integrations` | New endpoint |

> **Important:** All hooks in `src/hooks/` already point to the new paths. You do **not** need to update any hook URLs—the hooks are in sync with the new Postman collection.

---

## 2. How the API Layer is Built

```
src/
├── lib/
│   └── api-client.ts       ← Low-level fetch wrapper (get, post, put, patch, delete)
├── hooks/
│   ├── use-auth.ts          ← Login, register, roles, pending residents
│   ├── use-communities.ts   ← Communities, QR code, categories
│   ├── use-access-codes.ts  ← Access codes, rules, validation
│   ├── use-dues.ts          ← Community dues, due categories, charge profiles
│   ├── use-services.ts      ← Utilities, products, service charges, mapping
│   ├── use-wallets.ts       ← Wallet listing, create wallet by profile
│   ├── use-partners.ts      ← Partner listing and creation
│   ├── use-streets.ts       ← Street listing, creation, activation
│   ├── use-resident.ts      ← Resident dashboard, occupants
│   ├── use-integrations.ts  ← Payment/service integrations config
│   └── use-permissions.ts   ← Role-based permission checks
└── types/
    └── api.types.ts         ← All TypeScript types for request/response shapes
```

### The `apiClient` wrapper (`src/lib/api-client.ts`)

All hooks use `apiClient` instead of calling `fetch` directly. It:
- Prepends `NEXT_PUBLIC_API_BASE_URL` automatically
- Reads the JWT from `localStorage.getItem("token")` and adds `Authorization: Bearer <token>` to every request
- Throws an `ApiError` (with `.status` and `.data`) when the server returns a non-2xx response
- Accepts a `params` object for query-string parameters

```typescript
// Examples
apiClient.get<T>('/endpoint', { params: { page: 1 } })
apiClient.post<T>('/endpoint', bodyObject)
apiClient.put<T>('/endpoint', bodyObject)
apiClient.patch<T>('/endpoint', bodyObject)
apiClient.delete<T>('/endpoint')
```

> **Exception — file uploads:** The `createCommunity` function in `use-communities.ts` calls `fetch` directly (bypassing `apiClient`) because it sends `multipart/form-data`. This pattern should be reused for any future file-upload endpoints.

---

## 3. Authentication Flow

```
User enters credentials
        │
        ▼
POST /login  { username, password }
        │
        ▼
Response: { token, user_id, userType, profile }
        │
        ├── localStorage.setItem("token", token)
        ├── localStorage.setItem("userId", user_id)
        ├── localStorage.setItem("userType", userType)
        └── localStorage.setItem("userProfile", JSON.stringify(profile))
                │
                ▼
        Middleware checks token (src/middleware.ts)
        Redirects unauthenticated requests to login page
```

### Profile types

The `profile.profileType` field in the login response tells you what kind of user logged in:

| `profileType` | Who they are | Typical permissions |
|---|---|---|
| `System` | Super admin (Zamanni staff) | Everything |
| `Community` | Community admin or staff | Scoped to their community |
| `Resident` | Resident of a community | Self-service only |
| `Developer` | Property developer | Similar to Resident |

Use `usePermissions()` (`src/hooks/use-permissions.ts`) to gate UI sections instead of reading `profileType` directly.

### First-time password change

When a user logs in for the first time, the API may return:
```json
{ "error": "...", "mustChangePassword": "username" }
```
Check for `mustChangePassword` in the login error handler and redirect to the set-password screen.

**Hook:** `useSetPassword()` → `POST /users/set-password`
**Body:** `{ username, oldPassword, newPassword }`

---

## 4. Complete Endpoint Reference

### 4.1 Authentication

#### Login
```
POST /login
```
**Body:**
```json
{ "username": "string", "password": "string" }
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
    "profileType": "System | Community | Resident | Developer",
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
**Hook:** `useLogin()` from `use-auth.ts`

---

#### Register (Resident / Developer self-registration)
```
POST /register
```
**Body:**
```json
{
  "username": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "myCommunityID": "string",
  "street": "string",
  "number": "string",
  "type": "Resident | Developer",
  "gender": "Male | Female",
  "movedIn": "ISO date string",
  "password": "string"
}
```
**Response:** `{ "message": "string" }`
**Hook:** `useRegister()` from `use-auth.ts`

---

#### Set Password
```
POST /users/set-password
```
**Body:** `{ "username": "string", "oldPassword": "string", "newPassword": "string" }`
**Response:** `{ "message": "string" }`
**Hook:** `useSetPassword()` from `use-auth.ts`

---

#### Approve Pending Resident
```
POST /users/approve
```
**Body:** `{ "residentID": "string", "categoryID": "string" }`
**Response:** `{ "message": "string" }`
**Hook:** `useApproveResident()` from `use-auth.ts` — invalidates `pendingResidents` query on success

---

#### Create User With Role (Admin/Security/Staff)
```
POST /users/new-user
```
**Body:**
```json
{
  "username": "string",
  "name": "string",
  "phone": "string",
  "email": "string",
  "roleName": "string"
}
```
**Response:** `{ "message": "string" }`
**Hook:** `useCreateUserWithRole()` from `use-auth.ts`

---

#### Get Admin Roles (for current logged-in user)
```
GET /users/admin-roles
```
**Response:** `{ "roles": ["string"] }`
**Hook:** `useAdminRoles()` from `use-auth.ts`

---

#### List Pending Residents
```
GET /residents/pending
```
**Response:** `{ "success": true, "data": [User[]] }`
**Hook:** `usePendingResidents()` from `use-auth.ts`

---

#### Check if Username Exists
```
GET /users/:username
```
**Response:** `{ "data": {}, "message": "string", "success": boolean }`
**Hook:** `useCheckUsername(username)` from `use-auth.ts` — only fires when `username.length >= 4`

---

### 4.2 Communities

#### List All Communities
```
GET /community/communities
```
**Response:** `Community[]` — array of community objects
**Hook:** `useCommunities(filters?)` from `use-communities.ts`
**Filters:** `{ status?: "active" | "inactive", search?: string }`

---

#### Get Community QR Code + Details
```
GET /community/:id/qrcode
```
**Path param:** Community UUID
**Response:**
```json
{
  "message": "string",
  "name": "string",
  "myCommunityID": "string",
  "logoUrl": "string",
  "address": {},
  "qrCode": "base64 string"
}
```
**Hook:** `useCommunityQR(id)` from `use-communities.ts`
**UI use:** Show the `qrCode` (base64) in an `<img>` tag so residents can scan to join the community.

---

#### List Community Resident Categories
```
GET /community/categories
```
**Query param (optional):** `?id=<communityId>`
**Response:** `{ "data": CommunityCategory[], ... }`
**Hook:** `useCommunityCategories(communityId?)` from `use-communities.ts`

---

#### Create Community (with logo)
```
POST /community/new-community
Content-Type: multipart/form-data
```
**Form fields:**
```
name        — community name
address     — JSON string of { country, state, lga, city, street }
admin.name  — admin full name
admin.email
admin.phone
admin.username
logo        — File (image)
```
**Response:** `{ "data": {}, "message": "string", "success": boolean }`
**Hook:** `useCreateCommunity()` from `use-communities.ts` — accepts a `FormData` object

**How to build the FormData:**
```typescript
const formData = new FormData();
formData.append("name", communityName);
formData.append("address", JSON.stringify(addressObj));
formData.append("admin.name", adminName);
formData.append("admin.email", adminEmail);
formData.append("admin.phone", adminPhone);
formData.append("admin.username", adminUsername);
if (logoFile) formData.append("logo", logoFile);

const { mutate: createCommunity } = useCreateCommunity();
createCommunity(formData);
```

---

#### Create Community Resident Category
```
POST /community/new-collection
```
**Body:** `{ "category": "string", "description": "string" }`
**Hook:** `useCreateCommunityCategory()` from `use-communities.ts`

---

### 4.3 Access Codes & Rules

#### Get Active Access Codes (for resident)
```
GET /resident/access-codes/active
```
**Response:** `{ "data": AccessCode[], ... }`
**Hook:** `useActiveAccessCodes()` from `use-access-codes.ts`
**UI status:** Fully integrated

---

#### Generate Single Access Code (resident)
```
POST /resident/access/generate-code
```
**Body:**
```json
{
  "residentID": "string",
  "codeCategory": "string",
  "details": {}
}
```
**Response:** `{ "code": "string", "message": "string" }`
**Hook:** `useGenerateAccessCode()` from `use-access-codes.ts`
**UI status:** Fully integrated

---

#### Cancel an Access Code
```
GET /resident/access-codes/:code/cancel
```
**Path param:** The code string
**Hook:** `useCancelAccessCode()` from `use-access-codes.ts`
**UI status:** Fully integrated

---

#### Validate an Access Code (Security guard scan)
```
GET /access/:code/validate
Authorization: Bearer <token>  (apiKey scheme)
```
**Path param:** The code string
**Response:** `{ "data": {}, "message": "string", "success": boolean }`
**Hook:** `useValidateAccessCode()` from `use-access-codes.ts`
**UI status:** Fully integrated

---

#### Generate Bulk Codes
```
POST /access/generate-codes
```
**Body:** `{ "code_type": number, "count": number }`
**Response:** `{ "data": {}, "message": "string", "success": boolean }`
**Hook:** `useGenerateBulkCodes()` from `use-access-codes.ts`
**UI status:** Fully integrated

---

#### Create Access Rule (NEW)
```
POST /access/community-rules
```
Sets up rules for how access codes of a given category behave in a community (expiry, usage limits, etc.).

**Body:**
```json
{
  "myCommunityID": "string",
  "codeCategory": "string",
  "codeType": 1,
  "usageNumber": 1,
  "expirationType": "string",
  "expirationNumber": 24
}
```
**Response:** `{ "data": {}, "message": "string", "success": boolean }`
**Hook:** `useCreateAccessRule()` from `use-access-codes.ts`
**UI status:** Hook ready — **needs a settings/configuration UI**

---

### 4.4 Dues & Payments

#### List Due Categories
```
GET /community/due-categories
```
**Hook:** `useDueCategories()` from `use-dues.ts`
**UI status:** Hook ready — needs UI

---

#### Get Community Dues
```
GET /community/dues
```
**Hook:** `useCommunityDues()` from `use-dues.ts`
**UI status:** Hook ready — needs a Collections/Dues management page

---

#### Create a New Due
```
POST /community/new-due
```
**Body:**
```json
{
  "name": "string",
  "description": "string",
  "due_type": "Service Charge | Recurring | One Time",
  "amount": 0,
  "recur_type": "Monthly | Quarterly | Yearly",
  "resident_category": "categoryId",
  "wallet": "walletId"
}
```
**Hook:** `useCreateDue()` from `use-dues.ts`
**UI status:** Hook ready — needs UI

---

#### Get Resident Dues
```
GET /resident/dues
```
Returns the dues assigned to the logged-in resident, each with the last transaction.
**Hook:** `useResidentDues()` from `use-dues.ts`
**UI status:** Hook ready — needs a resident dues page

---

#### Pay a Due (Resident)
```
POST /resident/pay_due
```
**Body:**
```json
{
  "product_id": "string",
  "pay_amount": 0,
  "period": 1,
  "request_ref": "unique-ref",
  "remarks": "string"
}
```
**Hook:** `usePayDue()` from `use-dues.ts`
**UI status:** Hook ready — needs a payment dialog on the dues page

---

#### Due Charge Profiles

These configure how a due is distributed across wallets when paid.

| Endpoint | Method | Hook |
|---|---|---|
| `GET /config/create-due-profiles` | GET | `useDueChargeProfiles()` |
| `POST /config/create-due-profile` | POST | `useCreateDueChargeProfile()` |
| `PUT /config/update-due-profile` | PUT | `useUpdateDueChargeProfile()` |
| `PATCH /config/due-profile/:id/status?status=true\|false` | PATCH | `useToggleDueProfileStatus()` |

All hooks are in `use-dues.ts`. All need UI wiring.

---

### 4.5 Services & Utilities

Services are utility types like Electricity, Water, Internet, etc.
Products are the specific plans/packages under a service (e.g., "10GB data plan").
Service charges are the fees applied per community.

| Endpoint | Method | Hook | Notes |
|---|---|---|---|
| `GET /config/utilities` | GET | `useServices()` | List all services |
| `POST /config/utilities` | POST | `useCreateOrUpdateService()` | Create or edit (send `id` to edit) |
| `GET /config/utility-products` | GET | `useServiceProducts()` | List all products |
| `POST /config/utility-products` | POST | `useCreateOrUpdateServiceProduct()` | Create or edit product |
| `GET /config/service-charges` | GET | `useServiceCharges()` | List all service charges |
| `POST /config/service-charges` | POST | `useCreateOrUpdateServiceCharge()` | Create or edit charge |
| `GET /config/product-charges` | GET | `useProductCharges()` | List all product charges |
| `POST /config/product-charges` | POST | `useCreateOrUpdateProductCharge()` | Create or edit product charge |
| `GET /config/service-communities` | GET | `useServiceCommunities()` | List community→service mappings |
| `POST /config/utility-communities` | POST | `useMapServiceToCommunity()` | Map/edit a community service |
| `GET /resident/services` | GET | `useResidentServices()` | Services visible to a resident |
| `POST /resident/vas/pay` | POST | `useMakeVasPayment()` | Resident pays for a service/utility |

All hooks are in `use-services.ts`. All need UI wiring.

**VAS Payment body:**
```json
{
  "service_id": "string",
  "service_product_id": "string",
  "amount": 0,
  "password": "string",
  "request_ref": "unique-ref",
  "lookup_param": "string (e.g. meter number, phone number)"
}
```

---

### 4.6 Wallets

#### List Wallets
```
GET /wallets
```
**Hook:** `useWallets()` from `use-wallets.ts`
**UI status:** Hook ready — needs UI on wallet page

---

#### Create Wallet by Profile Type
```
PUT /wallets/:name/wallet-by-profile
```
Creates a wallet for a given profile type (e.g., `community`, `resident`).
**Path param:** `name` — the profile type slug
**Hook:** `useCreateWalletByProfile()` from `use-wallets.ts`
**UI status:** Hook ready — needs UI

> **Note:** The old guide mentioned endpoints for wallet transactions, transfer, fund, and withdraw. These are **not** in the new Postman collection and should be confirmed with the backend team before implementing.

---

### 4.7 Partners

Partners are external organizations or businesses linked to the platform.

#### List Partners
```
GET /partners
```
**Response:** `{ "data": Partner[], "message": "string", "success": boolean }`
Each partner includes their `wallet` and `user` info embedded.
**Hook:** `usePartners()` from `use-partners.ts`
**UI status:** Hook ready — **no page exists yet**

---

#### Create Partner
```
POST /partners/create-partner
```
**Body:**
```json
{
  "name": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "address": {}
}
```
**Hook:** `useCreatePartner()` from `use-partners.ts`
**UI status:** Hook ready — **no page exists yet**

---

### 4.8 Streets

Streets belong to a community and are used during resident registration so residents can specify their address accurately.

#### List Streets in a Community
```
GET /streets/community/:code
```
**Path param:** `code` — the community's `myCommunityID` (community code, not UUID)
**Response:** `CommunityStreet[]`
**Hook:** `useCommunityStreets(communityCode)` from `use-streets.ts`

---

#### Create a Street
```
POST /streets
```
**Body:** `{ "name": "string", "communityCode": "string" }`
**Hook:** `useCreateStreet()` from `use-streets.ts`

---

#### Toggle Street Activation Status
```
PUT /streets/:id/status/:action
```
**Path params:**
- `id` — street UUID
- `action` — `"activate"` or `"deactivate"`

**Hook:** `useToggleStreetStatus()` from `use-streets.ts`

**All three street hooks need UI wiring** — likely in the community detail page.

---

### 4.9 Resident Self-Service

#### Resident Dashboard
```
GET /report/resident/dashboard
```
Returns a resident's full overview in a single call.

**Response data shape** (`data` field):
```json
{
  "walletBalance": {
    "ledgerBalance": 0,
    "availableBalance": 0
  },
  "occupantStats": {
    "total": 0,
    "active": 0
  },
  "recentOccupants": [Occupant],
  "recentTransactions": [Transaction],
  "recentAccessCodes": [AccessCode]
}
```
**Hook:** `useResidentDashboard()` from `use-resident.ts`
**UI status:** Hook ready — **needs a resident-facing dashboard page**

---

#### Create or Update an Occupant
```
POST /resident/occupant
```
Occupants are people who live at the same address as the resident (spouse, flatmate, children, etc.).

**Body:**
```json
{
  "id": "string (omit or empty string for create)",
  "name": "string",
  "relationship": "Spouse | FlatMate | Child | Partner | Employee",
  "live_in": true,
  "is_active": true
}
```
**Hook:** `useCreateOrUpdateOccupant()` from `use-resident.ts`
**UI status:** Hook ready — **needs UI on resident profile page**

---

### 4.10 Configuration

#### List Integrations
```
GET /config/integrations
```
Integration records link services to their payment processors (e.g., Flutterwave, Paystack).
**Hook:** `useIntegrations()` from `use-integrations.ts`

---

#### Create or Update an Integration
```
POST /config/integrations
```
**Body:**
```json
{
  "id": "string (omit for create)",
  "name": "string",
  "method": "string",
  "description": "string"
}
```
**Hook:** `useCreateOrUpdateIntegration()` from `use-integrations.ts`
**UI status:** Both hooks ready — **needs an Integrations settings page**

---

## 5. Standard Response Shape

Almost every endpoint returns the same envelope:

```typescript
{
  success: boolean;   // true on 2xx, false/absent on error
  message: string;    // human-readable result description
  data?: T;           // the actual payload (array, object, or null)
}
```

The `ApiResponse<T>` type in `src/types/api.types.ts` models this.

When consuming hooks that return `data`, always unwrap:
```typescript
const response = await apiClient.get<ApiResponse<MyType[]>>('/endpoint');
return response.data || [];
```

**Error shape (4xx/5xx):**
```json
{ "message": "string", "success": false }
```
`ApiError` is thrown by `apiClient` and has `.status` (HTTP code) and `.data` (the full error body).

---

## 6. How to Wire a Hook to a Page

Here is the pattern used throughout this project, using a simple list page as an example:

```typescript
// src/app/(dashboard)/partners/page.tsx

"use client";

import { usePartners } from "@/hooks/use-partners";
import { useCreatePartner } from "@/hooks/use-partners";

export default function PartnersPage() {
  const { data: partners = [], isLoading, isError } = usePartners();

  if (isLoading) return <p>Loading...</p>;
  if (isError)   return <p>Failed to load partners.</p>;

  return (
    <ul>
      {partners.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

**For mutations (create / update / delete):**
```typescript
const { mutate, isPending, isError } = useCreatePartner();

function handleSubmit(formData) {
  mutate(formData, {
    onSuccess: () => {
      toast.success("Partner created");
      dialog.close();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
```

**Query cache invalidation** is already handled inside each mutation hook's `onSuccess` so the list automatically refreshes after a create/update.

---

## 7. New Features That Need UI

These are features with full backend support and ready hooks, but no page or component exists yet.

### 7.1 Partners Page `/partners`
- **List:** `usePartners()` — shows partner name, contact, wallet balance
- **Create:** `useCreatePartner()` — dialog with name, username, email, phone, address
- **File structure to create:**
  ```
  src/app/(dashboard)/partners/
    page.tsx
  src/components/partners/
    partner-table.tsx
    create-partner-dialog.tsx
  ```

### 7.2 Streets Management (inside community detail)
- **List streets** per community: `useCommunityStreets(communityCode)`
- **Add street:** `useCreateStreet()`
- **Toggle active/inactive:** `useToggleStreetStatus()`
- Suggested location: tab inside the community detail page

### 7.3 Resident Dashboard `/resident/dashboard`
- Single call `useResidentDashboard()` returns wallet balance, occupant stats, recent transactions, recent access codes
- The `ResidentDashboard` type in `api.types.ts` maps exactly to the response

### 7.4 Occupant Management (inside resident profile)
- `useCreateOrUpdateOccupant()` — add family members / flatmates
- The `Occupant` type (with relationship enum) is already in `api.types.ts`

### 7.5 Access Rules Configuration
- `useCreateAccessRule()` — lets admins define how each code category behaves (expiry, max uses)
- Likely lives inside a community settings page

### 7.6 Integrations Settings `/settings/integrations`
- `useIntegrations()` + `useCreateOrUpdateIntegration()` — manage payment/service processor configs

### 7.7 Community QR Code Display
- `useCommunityQR(id)` — returns a base64 QR code and community info
- Add a "View QR" button to the community card/detail page
- Render with `<img src={`data:image/png;base64,${qrCode}`} />`

---

## 8. Integration Checklist

Use this to track what still needs to be connected to the UI.

### Auth / Users
- [x] Login page — `useLogin()`
- [ ] Register page — `useRegister()`
- [ ] Set password screen — `useSetPassword()`
- [x] Pending residents table — `usePendingResidents()` + `useApproveResident()`
- [x] Create user dialog — `useCreateUserWithRole()` + `useAdminRoles()`

### Communities
- [x] Communities list page — `useCommunities()`
- [x] Create community dialog — `useCreateCommunity()`
- [ ] Community QR code display — `useCommunityQR(id)`
- [ ] Community categories tab — `useCommunityCategories()` + `useCreateCommunityCategory()`
- [ ] Community streets tab — `useCommunityStreets()` + `useCreateStreet()` + `useToggleStreetStatus()`

### Access Codes
- [x] Active codes list — `useActiveAccessCodes()`
- [x] Generate code — `useGenerateAccessCode()`
- [x] Cancel code — `useCancelAccessCode()`
- [x] Validate code (security) — `useValidateAccessCode()`
- [x] Bulk generate codes — `useGenerateBulkCodes()`
- [ ] Access rules configuration — `useCreateAccessRule()`

### Dues & Collections
- [ ] Dues list page — `useCommunityDues()` + `useDueCategories()`
- [ ] Create due dialog — `useCreateDue()`
- [ ] Resident dues page — `useResidentDues()` + `usePayDue()`
- [ ] Due charge profiles — `useDueChargeProfiles()` + `useCreateDueChargeProfile()` + `useUpdateDueChargeProfile()` + `useToggleDueProfileStatus()`

### Services / Utilities
- [ ] Services admin page — `useServices()` + `useCreateOrUpdateService()`
- [ ] Service products — `useServiceProducts()` + `useCreateOrUpdateServiceProduct()`
- [ ] Service charges — `useServiceCharges()` + `useCreateOrUpdateServiceCharge()`
- [ ] Product charges — `useProductCharges()` + `useCreateOrUpdateProductCharge()`
- [ ] Map service to community — `useServiceCommunities()` + `useMapServiceToCommunity()`
- [ ] Resident services page — `useResidentServices()` + `useMakeVasPayment()`

### Wallets
- [ ] Wallet list page — `useWallets()`
- [ ] Create wallet — `useCreateWalletByProfile()`

### Partners
- [ ] Partners page — `usePartners()` + `useCreatePartner()`

### Resident Self-Service
- [ ] Resident dashboard — `useResidentDashboard()`
- [ ] Occupant management — `useCreateOrUpdateOccupant()`

### Configuration
- [ ] Integrations settings — `useIntegrations()` + `useCreateOrUpdateIntegration()`

---

## Notes for the Design Team

- All list pages should show a loading skeleton when `isLoading` is `true`.
- All create/edit actions should use a dialog (modal) pattern already used on the communities and users pages.
- The `communityCode` (the short community ID like `ZMN-001`) and `communityID` (UUID) are two different fields. Streets use `communityCode`; most other endpoints use the UUID.
- Any form that accepts money values should display amounts in NGN (Nigerian Naira) and the wallet `availableBalance` is the spendable amount (not `ledgerBalance`).
- For file uploads, always use `multipart/form-data` and pass `FormData` directly—do not use `apiClient` for these; call `fetch` manually (follow the pattern in `use-communities.ts:createCommunity`).
