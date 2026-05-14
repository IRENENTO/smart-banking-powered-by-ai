# AI Banking - Authentication & Registration Flow Analysis

## Executive Summary

Your project has **3 separate mobile apps** and **1 web app**, each with different levels of auth implementation:

| App | Status | Login | Register | Profile Completion | Redirect |
|-----|--------|-------|----------|-------------------|----------|
| **web/** | ✅ Complete | ✅ Works | ✅ Works | ✅ Multi-step | ✅ Works |
| **ai-banking-mobile/** | ⚠️ Partial | ✅ Works | ⚠️ Incomplete | ❌ Missing | ✅ Works |
| **mobile/** | ❌ Incomplete | ✅ Basic | ❌ Missing | ❌ N/A | ⚠️ Simple |

---

## 1. WEB APPLICATION (web/src) - ✅ FULLY IMPLEMENTED

### Location of Auth Components:
- **Login Page**: [web/src/pages/Login.tsx](web/src/pages/Login.tsx)
- **Register Page**: [web/src/pages/Register.tsx](web/src/pages/Register.tsx)
- **App Routes**: [web/src/App.tsx](web/src/App.tsx)
- **Route Guard**: [web/src/components/RouteGuard.tsx](web/src/components/RouteGuard.tsx)
- **API Service**: [web/src/services/api.ts](web/src/services/api.ts)
- **OTP Service**: [web/src/services/otpService.ts](web/src/services/otpService.ts)

### Login Flow:
```
User enters credentials
         ↓
POST /auth/login
         ↓
Success: Store token + user in localStorage
         ↓
navigate('/dashboard')
         ↓
RouteGuard checks verification flags
         ↓
All verified → Dashboard ✅
```

**Key Code** ([web/src/pages/Login.tsx](web/src/pages/Login.tsx), lines 30-38):
```typescript
const res = await authService.login({ email, password });
localStorage.setItem('token', res.data.token);
localStorage.setItem('user', JSON.stringify(res.data.user));
navigate('/dashboard');
```

### Register Flow - Multi-Step Process:
```
1. User fills registration form
         ↓
POST /auth/register
         ↓
2. Auto-login with same credentials
         ↓
POST /auth/login
         ↓
3. Store token + user in localStorage
         ↓
navigate('/dashboard')
         ↓
4. RouteGuard intercepts & routes to verification flows:
   - email_verified? NO → /verify-otp
   - profile_completed? NO → /complete-profile
   - pin_set? NO → /set-security
   - kyc_status='verified'? NO → /upload-kyc
```

**Key Code** ([web/src/pages/Register.tsx](web/src/pages/Register.tsx), lines 112-119):
```typescript
await authService.register({ name, email, phone, password });
const loginRes = await authService.login({ email, password });
localStorage.setItem('token', loginRes.data.token);
localStorage.setItem('user', JSON.stringify(loginRes.data.user));
navigate('/dashboard');
```

### Post-Login Verification Flow:
The [RouteGuard.tsx](web/src/components/RouteGuard.tsx) component manages the multi-step flow:

**Pages in Sequence** (from [web/src/App.tsx](web/src/App.tsx)):
1. `/verify-otp` - Email verification
2. `/complete-profile` - Personal info (DOB, address, national ID)
3. `/set-security` - PIN setup
4. `/upload-kyc` - Document verification
5. `/dashboard` - Main dashboard

**Implementation** ([web/src/components/RouteGuard.tsx](web/src/components/RouteGuard.tsx), lines 44-72):
```typescript
if (requireVerification && !userData.email_verified) {
    navigate('/verify-otp', { state: { from: location.pathname } });
}

if (requireProfile && !userData.profile_completed) {
    navigate('/complete-profile', { state: { from: location.pathname } });
}

if (requirePin && !userData.pin_set) {
    navigate('/set-security', { state: { from: location.pathname } });
}

if (requireKyc && userData.kyc_status !== 'verified') {
    navigate('/upload-kyc', { state: { from: location.pathname } });
}
```

---

## 2. REACT NATIVE (ai-banking-mobile/) - ⚠️ PARTIALLY IMPLEMENTED

### Location of Auth Components:
- **Login Screen**: [ai-banking-mobile/src/screens/LoginScreen.tsx](ai-banking-mobile/src/screens/LoginScreen.tsx)
- **Register Screen**: [ai-banking-mobile/src/screens/RegisterScreen.tsx](ai-banking-mobile/src/screens/RegisterScreen.tsx)
- **Profile Screen**: [ai-banking-mobile/src/screens/ProfileScreen.tsx](ai-banking-mobile/src/screens/ProfileScreen.tsx)
- **Navigation**: [ai-banking-mobile/src/navigation/AppNavigator.tsx](ai-banking-mobile/src/navigation/AppNavigator.tsx)
- **API Service**: [ai-banking-mobile/src/services/api.ts](ai-banking-mobile/src/services/api.ts)

### Navigation Structure:
```
Stack.Navigator
├── Login (initial screen)
├── Register
└── MainTabs (bottom tab navigation)
    ├── Home → HomeScreen
    ├── Loans → LoansScreen
    ├── Transactions → TransactionsScreen
    └── Profile → ProfileScreen
```

### Login Flow - ✅ WORKING:
```
User enters email/password on LoginScreen
         ↓
POST /auth/login (API_URL: http://10.0.2.2:5001/api)
         ↓
Success response contains token
         ↓
setAuthToken(response.data.token) - stores in memory
         ↓
navigation.replace('MainTabs') - IMMEDIATE redirect
         ↓
HomeScreen displays ✅
```

**Key Code** ([ai-banking-mobile/src/screens/LoginScreen.tsx](ai-banking-mobile/src/screens/LoginScreen.tsx), lines 17-21):
```typescript
const response = await api.post('/auth/login', { email, password });
if (response.data && response.data.token) {
    setAuthToken(response.data.token);
    navigation.replace('MainTabs');
}
```

**Why It Works:**
- Uses `navigation.replace()` instead of `navigate()` - doesn't leave login screen on back stack
- Sets token immediately via `setAuthToken()`
- API interceptor adds token to all subsequent requests

### Register Flow - ⚠️ INCOMPLETE:
```
User fills form (name, email, phone, password)
         ↓
POST /auth/register
         ↓
Backend creates user + sets flags:
  - email_verified: false
  - profile_completed: false
  - pin_set: false
  - kyc_status: 'pending'
         ↓
Alert: "Registration successful. Please login."
         ↓
navigation.navigate('Login')
         ↓
❌ PROBLEM: No auto-login, no verification flow
❌ User must manually login after registration
❌ No profile completion step
❌ No KYC or PIN setup
```

**Key Code** ([ai-banking-mobile/src/screens/RegisterScreen.tsx](ai-banking-mobile/src/screens/RegisterScreen.tsx), lines 20-26):
```typescript
await api.post('/auth/register', { name, email, phone, password });
Alert.alert('Success', 'Registration successful. Please login.', [
    { text: 'OK', onPress: () => navigation.navigate('Login') }
]);
```

### Issues:
1. **No Multi-Step Flow**: Unlike web, there's no OTP verification, profile completion, or KYC upload
2. **No Auto-Login**: User must manually login after registration
3. **[ProfileScreen.tsx](ai-banking-mobile/src/screens/ProfileScreen.tsx) is Hardcoded**: Shows dummy data "User Name", not fetched from backend
4. **Token Storage**: Uses in-memory store, will be lost on app restart (should use AsyncStorage)

---

## 3. ALTERNATE MOBILE APP (mobile/) - ❌ INCOMPLETE

### Location of Auth Components:
- **Login Screen**: [mobile/src/screens/LoginScreen.tsx](mobile/src/screens/LoginScreen.tsx)
- **API Service**: [mobile/src/services/api.ts](mobile/src/services/api.ts)
- **Auth Store**: [mobile/src/store/authStore.ts](mobile/src/store/authStore.ts) - **EMPTY FILE**

### Issues:
1. **Auth Store is Empty** - No Redux or state management implemented
2. **No Register Screen** - Registration not implemented at all
3. **No Navigation Config** - No AppNavigator.tsx file
4. **Different API Pattern** - Passes token as route params instead of storing globally

**Code** ([mobile/src/screens/LoginScreen.tsx](mobile/src/screens/LoginScreen.tsx), lines 12-15):
```typescript
const res = await authService.login({ email, password });
navigation.navigate('Home', { token: res.data.token, user: res.data.user });
```

⚠️ **Recommendation**: This appears to be a deprecated/incomplete version. Use `ai-banking-mobile` instead.

---

## 4. BACKEND API (backend/src) - API Response Format

### Login Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "email_verified": false,
        "profile_completed": false,
        "pin_set": false,
        "kyc_status": "pending"
    }
}
```

**Location**: [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js), lines 62-66

### Register Response:
```json
{
    "msg": "Registration successful. Please verify your email to continue.",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "phone": "+250788123456"
    }
}
```

**Location**: [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js), lines 36-37

### Routes:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

**Location**: [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js)

---

## 5. ANSWERS TO YOUR SPECIFIC QUESTIONS

### Q1: Where are login/auth screens and routes?

| Platform | Location |
|----------|----------|
| **Web** | [web/src/pages/Login.tsx](web/src/pages/Login.tsx), [web/src/pages/Register.tsx](web/src/pages/Register.tsx) |
| **Mobile (ai-banking-mobile)** | [ai-banking-mobile/src/screens/LoginScreen.tsx](ai-banking-mobile/src/screens/LoginScreen.tsx), [ai-banking-mobile/src/screens/RegisterScreen.tsx](ai-banking-mobile/src/screens/RegisterScreen.tsx) |
| **Mobile (mobile)** | [mobile/src/screens/LoginScreen.tsx](mobile/src/screens/LoginScreen.tsx) |
| **Backend Routes** | [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js) |

### Q2: What happens after successful login - redirect logic?

**Web** ([web/src/pages/Login.tsx](web/src/pages/Login.tsx), line 35):
```typescript
navigate('/dashboard');  // ✅ Direct redirect to dashboard
```

**Mobile (ai-banking-mobile)** ([ai-banking-mobile/src/screens/LoginScreen.tsx](ai-banking-mobile/src/screens/LoginScreen.tsx), line 21):
```typescript
navigation.replace('MainTabs');  // ✅ Uses replace() to avoid back stack issues
```

**Key Difference**: Web uses `navigate()`, mobile uses `replace()`. Mobile's approach is better for login flows.

### Q3: What happens after registration - profile completion?

**Web** ✅:
- Auto-login happens in [web/src/pages/Register.tsx](web/src/pages/Register.tsx)
- Redirects to `/dashboard`
- RouteGuard catches missing flags and routes to:
  1. `/verify-otp` (email verification)
  2. `/complete-profile` (personal info)
  3. `/set-security` (PIN setup)
  4. `/upload-kyc` (KYC documents)

**Mobile (ai-banking-mobile)** ❌:
- No auto-login in [ai-banking-mobile/src/screens/RegisterScreen.tsx](ai-banking-mobile/src/screens/RegisterScreen.tsx)
- User sees alert and must manually go back to login
- No multi-step flow implemented
- **FIX NEEDED**: Implement web-style auto-login and routing logic

### Q4: Are there multiple screens in registration flow?

**Web** ✅ YES - 4 additional screens:
1. [web/src/pages/VerifyOTP.tsx](web/src/pages/VerifyOTP.tsx)
2. [web/src/pages/CompleteProfile.tsx](web/src/pages/CompleteProfile.tsx)
3. [web/src/pages/SetSecurity.tsx](web/src/pages/SetSecurity.tsx)
4. [web/src/pages/UploadKYC.tsx](web/src/pages/UploadKYC.tsx)

**Mobile (ai-banking-mobile)** ❌ NO - Only one register screen:
- [ai-banking-mobile/src/screens/RegisterScreen.tsx](ai-banking-mobile/src/screens/RegisterScreen.tsx)
- No follow-up screens for profile completion

### Q5: Navigation logic preventing redirect to dashboard?

**Web** ✅ WORKING:
- [RouteGuard.tsx](web/src/components/RouteGuard.tsx) properly chains redirects
- Uses `state: { from: location.pathname }` to allow returning after completing steps

**Mobile (ai-banking-mobile)** ✅ WORKING (for login):
- `navigation.replace('MainTabs')` works correctly
- **BUT**: Registration doesn't trigger the redirect loop

**Mobile (mobile)** ⚠️ NEEDS WORK:
- No navigation structure defined
- Passes tokens as params instead of storing globally
- No RouteGuard equivalent

---

## 6. ISSUES SUMMARY & RECOMMENDATIONS

### Critical Issues:

**Mobile (ai-banking-mobile):**
1. ❌ **No auto-login after registration** → User must manually login
2. ❌ **No multi-step verification flow** → Missing email verification, profile completion, PIN setup, KYC
3. ❌ **Token stored in memory** → Lost on app restart (use AsyncStorage)
4. ❌ **ProfileScreen has hardcoded data** → Should fetch from API

**Mobile (mobile/):**
1. ❌ **No register functionality** → Cannot create accounts
2. ❌ **Empty auth store** → No state management
3. ❌ **No navigation structure** → No organized flow
4. ❌ **Deprecated** → Should consolidate with ai-banking-mobile

### Recommended Fixes:

**1. Update RegisterScreen.tsx** - Implement auto-login and routing:
```typescript
const handleRegister = async () => {
    try {
        await api.post('/auth/register', { name, email, phone, password });
        
        // Auto-login after successful registration
        const loginRes = await api.post('/auth/login', { email, password });
        setAuthToken(loginRes.data.token);
        
        // Store user info
        // Route to verification flow or main tabs
        navigation.replace('MainTabs');
    } catch (error) {
        Alert.alert('Error', error.response?.data?.msg);
    }
};
```

**2. Add multi-step flow** - Create verification screens similar to web:
- `VerifyOTPScreen.tsx`
- `CompleteProfileScreen.tsx`
- `SetSecurityScreen.tsx`
- `UploadKYCScreen.tsx`

**3. Fix token persistence** - Use AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAuthToken = async (token: string | null) => {
    if (token) {
        await AsyncStorage.setItem('authToken', token);
    } else {
        await AsyncStorage.removeItem('authToken');
    }
    currentToken = token;
};
```

**4. Consolidate apps** - Consider merging mobile/ into ai-banking-mobile/ or removing it.

---

## 7. API INTERCEPTOR LOGIC

All platforms use similar response normalization:

**Web** ([web/src/services/api.ts](web/src/services/api.ts), lines 14-21):
```typescript
api.interceptors.response.use((response) => {
    // Unpack custom response format: { success, data, message } → data
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        response.data = response.data.data;
    }
    return response;
});
```

**Mobile** ([ai-banking-mobile/src/services/api.ts](ai-banking-mobile/src/services/api.ts), lines 32-39):
```typescript
api.interceptors.response.use((response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        response.data = response.data.data;
    }
    return response;
});
```

This normalizes API responses across all endpoints.

---

## File Reference Guide

| Component | File | Key Lines |
|-----------|------|-----------|
| Web Login | [web/src/pages/Login.tsx](web/src/pages/Login.tsx) | 30-38 |
| Web Register | [web/src/pages/Register.tsx](web/src/pages/Register.tsx) | 112-119 |
| Web Routes | [web/src/App.tsx](web/src/App.tsx) | 51-65 |
| Web Route Guard | [web/src/components/RouteGuard.tsx](web/src/components/RouteGuard.tsx) | 44-72 |
| Mobile Login | [ai-banking-mobile/src/screens/LoginScreen.tsx](ai-banking-mobile/src/screens/LoginScreen.tsx) | 17-21 |
| Mobile Register | [ai-banking-mobile/src/screens/RegisterScreen.tsx](ai-banking-mobile/src/screens/RegisterScreen.tsx) | 20-26 |
| Mobile Nav | [ai-banking-mobile/src/navigation/AppNavigator.tsx](ai-banking-mobile/src/navigation/AppNavigator.tsx) | 28-46 |
| Backend Login | [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js) | 45-67 |
| Backend Register | [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js) | 4-42 |
