# Optional Chaining Review

This document lists all instances of optional chaining (`?.`) found in the source code.

## Summary
- **Total files with optional chaining**: 11
- **Total instances**: ~30

---

## File-by-File Breakdown

### 1. `app/app/page.tsx` (5 instances)

**Line 92**: `session?.user?.id`
```typescript
if (session?.user?.id) {
  // Logged in user - fetch from API
```

**Line 271**: `session?.user?.id`
```typescript
if (!session?.user?.id) {
  // Check anonymous usage limit (overall, not monthly)
```

**Line 297**: `!session?.user?.id`
```typescript
isAnonymous: !session?.user?.id,
```

**Line 322**: `!session?.user?.id`
```typescript
if (!session?.user?.id) {
  // Update anonymous usage (overall, not monthly)
```

**Line 769**: `TECH_CONTEXTS.find(...)?.description`
```typescript
description={TECH_CONTEXTS.find(t => t.value === techContext)?.description || "Select your technology context"}
```

---

### 2. `components/ResourceTabs.tsx` (4 instances)

**Line 34**: `res?.title`
```typescript
{res?.title}
```

**Line 42**: `resources[activeIndex]?.title`
```typescript
{resources[activeIndex]?.title}
```

**Line 44**: `resources[activeIndex]?.description`
```typescript
{resources[activeIndex]?.description && (
```

**Line 61**: `resources[activeIndex]?.url`
```typescript
{resources[activeIndex]?.url}
```

---

### 3. `components/Header.tsx` (3 instances)

**Line 30**: `session.user?.name`
```typescript
name: session.user?.name,
```

**Line 31**: `session.user?.email`
```typescript
email: session.user?.email,
```

**Line 32**: `session.user?.image`
```typescript
image: session.user?.image,
```

---

### 4. `app/api/explain-error/route.ts` (5 instances)

**Line 54**: `!session?.user?.id`
```typescript
if (!session?.user?.id && !isAnonymous) {
```

**Line 69**: `session?.user?.id`
```typescript
if (session?.user?.id) {
```

**Line 167**: `data.choices?.[0]?.message?.content`
```typescript
let explanation = data.choices?.[0]?.message?.content;
```

**Line 189**: `outOfContextMatch[1]?.replace`
```typescript
const message = outOfContextMatch[1]?.replace(/\\n/g, '\n') || "...";
```

**Line 210**: `session?.user?.id`
```typescript
if (session?.user?.id) {
```

---

### 5. `app/api/usage/route.ts` (2 instances)

**Line 14**: `!session?.user?.id`
```typescript
if (!session?.user?.id) {
```

**Line 29**: `subscription?.status`
```typescript
const isPro = subscription?.status === "active" || subscription?.status === "trialing";
```

---

### 6. `app/dashboard/page.tsx` (1 instance)

**Line 452**: `selectedQuery?.id`
```typescript
selectedQuery?.id === query.id
```

---

### 7. `components/UserProfileDropdown.tsx` (1 instance)

**Line 58**: `user.name?.charAt(0)`
```typescript
{user.name?.charAt(0).toUpperCase() || "U"}
```

---

### 8. `app/api/queries/route.ts` (1 instance)

**Line 10**: `!session?.user?.id`
```typescript
if (!session?.user?.id) {
```

---

### 9. `app/api/cancel-subscription/route.ts` (1 instance)

**Line 15**: `!session?.user?.id`
```typescript
if (!session?.user?.id) {
```

---

### 10. `app/api/webhook/route.ts` (3 instances)

**Line 55**: `(customer as Stripe.Customer).metadata?.userId`
```typescript
const userId = (customer as Stripe.Customer).metadata?.userId;
```

**Line 131**: `(customer as Stripe.Customer).metadata?.userId`
```typescript
const userId = (customer as Stripe.Customer).metadata?.userId;
```

**Line 176**: `(customer as Stripe.Customer).metadata?.userId`
```typescript
const userId = (customer as Stripe.Customer).metadata?.userId;
```

---

### 11. `app/api/create-checkout/route.ts` (2 instances)

**Line 15**: `!session?.user?.id`
```typescript
if (!session?.user?.id || !session.user.email) {
```

**Line 32**: `existingSubscription?.stripeCustomerId`
```typescript
let customerId = existingSubscription?.stripeCustomerId;
```

---

## Patterns Observed

### Most Common Patterns:
1. **Session checks**: `session?.user?.id` (appears 10+ times)
   - Used for authentication/authorization checks
   - Safe access to nested user ID

2. **Array/object access**: `array[index]?.property`
   - Used in ResourceTabs for safe array access
   - Used in API responses: `data.choices?.[0]?.message?.content`

3. **Optional properties**: `object?.property`
   - User profile data: `session.user?.name`, `session.user?.email`, `session.user?.image`
   - Subscription status: `subscription?.status`
   - Metadata access: `metadata?.userId`

4. **Method chaining**: `object?.method()`
   - `user.name?.charAt(0)`
   - `outOfContextMatch[1]?.replace(...)`

### Usage Context:
- **Authentication/Authorization**: Most common use case (checking if user is logged in)
- **API Response Handling**: Safe access to nested API response data
- **UI Rendering**: Safe access to optional properties in components
- **Stripe Integration**: Safe access to customer metadata

---

## Notes

All instances appear to be appropriate uses of optional chaining, providing safe access to potentially undefined/null values. The code follows good practices by:
- Checking for session existence before accessing user properties
- Safely accessing array elements that may not exist
- Handling optional API response fields
- Accessing optional object properties without throwing errors

