# API Hooks Reference

Complete reference for all TanStack Query hooks in the Zamanni Community project.

## Table of Contents

- [Authentication Hooks](#authentication-hooks)
- [Community Hooks](#community-hooks)
- [User Hooks](#user-hooks)
- [Access Code Hooks](#access-code-hooks)
- [Due & Payment Hooks](#due--payment-hooks)
- [Service & Utility Hooks](#service--utility-hooks)
- [Wallet Hooks](#wallet-hooks)
- [Partner Hooks](#partner-hooks)
- [Street Hooks](#street-hooks)
- [Resident Hooks](#resident-hooks)
- [Integration Hooks](#integration-hooks)

---

## Authentication Hooks

### `useLogin()`
Authenticate user and receive JWT token.

```typescript
const login = useLogin();

await login.mutateAsync({
  username: "user@example.com",
  password: "password123"
});

// Auto-stores token and user data in localStorage
```

### `useLogout()`
Clear authentication data.

```typescript
const logout = useLogout();
logout(); // Clears localStorage and query cache
```

### `useRegister()`
Register a new resident or developer.

```typescript
const register = useRegister();

await register.mutateAsync({
  username: "johndoe",
  name: "John Doe",
  email: "john@example.com",
  phone: "08012345678",
  myCommunityID: "COM123",
  street: "Main Street",
  number: "15",
  type: "Resident",
  gender: "Male",
  movedIn: "2025-01-15T00:00:00Z"
});
```

### `useSetPassword()`
Change password from default.

```typescript
const setPassword = useSetPassword();

await setPassword.mutateAsync({
  username: "johndoe",
  oldPassword: "defaultPass",
  newPassword: "newSecurePass123"
});
```

### `useApproveResident()`
Approve a pending resident.

```typescript
const approve = useApproveResident();

await approve.mutateAsync({
  residentID: "res-123",
  categoryID: "cat-456"
});
```

### `usePendingResidents()`
Get all residents awaiting approval.

```typescript
const { data: pendingResidents } = usePendingResidents();
```

### `useCurrentUser()`
Get current authenticated user from localStorage.

```typescript
const { data: user } = useCurrentUser();
```

### `useIsAuthenticated()`
Check if user is authenticated.

```typescript
const isAuth = useIsAuthenticated(); // returns boolean
```

---

## Community Hooks

### `useCommunities(filters?)`
Get all communities.

```typescript
const { data: communities } = useCommunities();
const { data: activeCommunities } = useCommunities({ status: "active" });
```

### `useCommunity(id)`
Get a single community.

```typescript
const { data: community } = useCommunity("community-id");
```

### `useCommunityQR(id)`
Get community QR code.

```typescript
const { data: qrData } = useCommunityQR("community-id");
// qrData.qrCode contains base64 encoded image
```

### `useCommunityCategories(communityId?)`
Get resident categories for a community.

```typescript
const { data: categories } = useCommunityCategories();
```

### `useCreateCommunity()`
Create a new community with logo upload.

```typescript
const createCommunity = useCreateCommunity();

const formData = new FormData();
formData.append("logo", logoFile);
formData.append("payload", JSON.stringify({
  name: "Green Valley Estate",
  address: { /*...*/ },
  admin: { /*...*/ }
}));

await createCommunity.mutateAsync(formData);
```

---

## User Hooks

### `useUsers(filters?)`
Get all users.

```typescript
const { data: users } = useUsers();
const { data: activeUsers } = useUsers({ status: "active" });
const { data: communityUsers } = useUsers({ communityId: "com-123" });
```

### `useUser(id)`
Get a single user.

```typescript
const { data: user } = useUser("user-id");
```

### `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`
CRUD operations for users.

```typescript
const createUser = useCreateUser();
const updateUser = useUpdateUser();
const deleteUser = useDeleteUser();
```

---

## Access Code Hooks

### `useActiveAccessCodes()`
Get all active access codes for current user.

```typescript
const { data: accessCodes } = useActiveAccessCodes();
```

### `useGenerateAccessCode()`
Generate a new access code.

```typescript
const generate = useGenerateAccessCode();

await generate.mutateAsync({
  residentID: "res-123",
  codeCategory: "Visitor",
  details: { visitorName: "John Doe" }
});
```

### `useCancelAccessCode()`
Cancel an access code.

```typescript
const cancel = useCancelAccessCode();
await cancel.mutateAsync("CODE123");
```

### `useValidateAccessCode()`
Validate an access code (for security).

```typescript
const validate = useValidateAccessCode();
await validate.mutateAsync("CODE123");
```

---

## Due & Payment Hooks

### `useDueCategories()`
Get all due categories.

```typescript
const { data: categories } = useDueCategories();
```

### `useCommunityDues()`
Get all dues for the community.

```typescript
const { data: dues } = useCommunityDues();
```

### `useResidentDues()`
Get dues for a resident with last transaction.

```typescript
const { data: dues } = useResidentDues();
```

### `useCreateDue()`
Create a new community due.

```typescript
const createDue = useCreateDue();

await createDue.mutateAsync({
  name: "Monthly Service Charge",
  due_type: "Service Charge",
  amount: 50000,
  recur_type: "Monthly",
  wallet: "wallet-id"
});
```

### `usePayDue()`
Make a due payment.

```typescript
const payDue = usePayDue();

await payDue.mutateAsync({
  product_id: "due-id",
  pay_amount: 50000,
  period: 1
});
```

---

## Service & Utility Hooks

### `useServices()`
Get all services.

```typescript
const { data: services } = useServices();
```

### `useResidentServices()`
Get services available to resident.

```typescript
const { data: services } = useResidentServices();
```

### `useMakeVasPayment()`
Make VAS payment (airtime, data, utilities).

```typescript
const makePayment = useMakeVasPayment();

await makePayment.mutateAsync({
  service_id: "srv-123",
  service_product_id: "prod-456",
  amount: 1000,
  password: "userPin",
  request_ref: "unique-ref-123"
});
```

### `useServiceProducts()`
Get all service products.

```typescript
const { data: products } = useServiceProducts();
```

---

## Wallet Hooks

### `useWallets(profileType?)`
Get all wallets.

```typescript
const { data: wallets } = useWallets();
const { data: communityWallets } = useWallets("Community");
```

### `useMyWalletBalance()`
Get current user's wallet balance.

```typescript
const { data: balance } = useMyWalletBalance();
// balance.ledgerBalance, balance.availableBalance
```

---

## Partner Hooks

### `usePartners()`
Get all partners.

```typescript
const { data: partners } = usePartners();
```

### `useCreatePartner()`
Create a new partner.

```typescript
const createPartner = useCreatePartner();

await createPartner.mutateAsync({
  name: "Partner Name",
  username: "partner123",
  email: "partner@example.com",
  phone: "08012345678"
});
```

---

## Street Hooks

### `useCommunityStreets(communityCode)`
Get all streets in a community.

```typescript
const { data: streets } = useCommunityStreets("COM123");
```

### `useCreateStreet()`
Create a new street.

```typescript
const createStreet = useCreateStreet();

await createStreet.mutateAsync({
  name: "Main Street",
  communityCode: "COM123"
});
```

### `useToggleStreetStatus()`
Activate/deactivate a street.

```typescript
const toggleStatus = useToggleStreetStatus();

await toggleStatus.mutateAsync({
  id: "street-id",
  action: "activate" // or "deactivate"
});
```

---

## Resident Hooks

### `useResidentDashboard()`
Get resident dashboard data.

```typescript
const { data: dashboard } = useResidentDashboard();
// Includes: wallet balance, occupant stats, recent items
```

### `useCreateOrUpdateOccupant()`
Manage occupants.

```typescript
const manageOccupant = useCreateOrUpdateOccupant();

// Create
await manageOccupant.mutateAsync({
  name: "Jane Doe",
  relationship: "Spouse",
  live_in: true,
  is_active: true
});

// Update
await manageOccupant.mutateAsync({
  id: "occupant-id",
  name: "Jane Doe",
  live_in: false
});
```

---

## Integration Hooks

### `useIntegrations()`
Get all integrations.

```typescript
const { data: integrations } = useIntegrations();
```

### `useCreateOrUpdateIntegration()`
Manage integrations.

```typescript
const manageIntegration = useCreateOrUpdateIntegration();

await manageIntegration.mutateAsync({
  name: "Paystack",
  method: "API",
  description: "Payment gateway"
});
```

---

## Common Patterns

### Error Handling

```typescript
const login = useLogin();

try {
  await login.mutateAsync(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.message);
  }
}

// OR using mutation state
<button disabled={login.isPending}>
  {login.isPending ? "Logging in..." : "Login"}
</button>

{login.isError && <p>Error: {login.error.message}</p>}
```

### Loading States

```typescript
const { data, isLoading, isFetching, isError } = useCommunities();

if (isLoading) return <Spinner />;
if (isError) return <Error />;

return <DataList data={data} />;
```

### Optimistic Updates

```typescript
const updateCommunity = useUpdateCommunity();

await updateCommunity.mutateAsync(
  { id: "123", name: "New Name" },
  {
    onSuccess: () => {
      toast.success("Updated!");
    },
    onError: () => {
      toast.error("Failed to update");
    }
  }
);
```

### Dependent Queries

```typescript
const { data: user } = useUser(userId);
const { data: community } = useCommunity(user?.communityID, {
  enabled: !!user?.communityID
});
```

---

## Type Imports

All types are available from `@/types/api.types`:

```typescript
import type {
  Community,
  User,
  AccessCode,
  Due,
  Service,
  // ... etc
} from "@/types/api.types";
```

## Constants

All constants are available from `@/lib/constants`:

```typescript
import {
  USER_TYPES,
  ACCESS_CODE_STATUS,
  DUE_TYPES,
  // ... etc
} from "@/lib/constants";
```

## Utilities

All utilities are available from `@/lib/utils`:

```typescript
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  isValidEmail,
  // ... etc
} from "@/lib/utils";
```
