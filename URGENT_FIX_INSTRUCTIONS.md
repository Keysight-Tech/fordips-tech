# URGENT: Fix Login, Signup, Add to Cart, Checkout Freezing

## Problem
When users click login, signup, add to cart, or checkout buttons, the website freezes because:

1. **RLS infinite recursion error** in Supabase causes `loadUserCart()` to hang
2. **Missing `showUserDashboard()` function** causes JavaScript error
3. **No timeout protection** on cart loading operations

## Solution - Apply These 3 Fixes

### Step 1: Run FIX_RLS_POLICIES.sql (CRITICAL!)

**THIS MUST BE DONE FIRST or nothing will work!**

1. Go to: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
2. Click "New Query"
3. Open: `D:\Projects\Figma\outputs\websites\fordips-tech\FIX_RLS_POLICIES.sql`
4. Copy ALL → Paste → Click "Run"

✅ **This fixes the RLS infinite recursion error!**

---

### Step 2: Apply JavaScript Fixes

Open `D:\Projects\Figma\outputs\websites\fordips-tech\supabase-integration.js` and make these 3 changes:

#### Fix 1: Replace `checkAuth()` function (around line 37)

**Find this:**
```javascript
// Check if user is logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    if (user) {
        // Load user cart from database
        await loadUserCart();
        updateUIForLoggedInUser();
    }

    return user;
}
```

**Replace with:**
```javascript
// Check if user is logged in
async function checkAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;

        if (user) {
            // Load user cart from database with timeout protection
            try {
                await Promise.race([
                    loadUserCart(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Cart load timeout')), 5000)
                    )
                ]);
            } catch (cartError) {
                console.warn('⚠️ Could not load cart from database, using local cart:', cartError.message);
                // Don't block login if cart fails to load
            }
            updateUIForLoggedInUser();
        }

        return user;
    } catch (error) {
        console.error('Error checking auth:', error);
        return null;
    }
}
```

---

#### Fix 2: Replace `signIn()` function (around line 73)

**Find this:**
```javascript
// Sign in existing user
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;
        await loadUserCart();
        updateUIForLoggedInUser();

        return { success: true, user: data.user };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Login error:', error);
        return { success: false, error: error.message };
    }
}
```

**Replace with:**
```javascript
// Sign in existing user
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;

        // Load user cart with error handling - don't block login if it fails
        try {
            await Promise.race([
                loadUserCart(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Cart load timeout')), 5000)
                )
            ]);
        } catch (cartError) {
            console.warn('⚠️ Could not load cart:', cartError.message);
            // Continue with login even if cart fails
        }

        updateUIForLoggedInUser();

        return { success: true, user: data.user };
    } catch (error) {
        window.FORDIPS_CONFIG?.logger.error('Login error:', error);
        return { success: false, error: error.message };
    }
}
```

---

#### Fix 3: Add `showUserDashboard()` function (after line 122, after `updateUIForLoggedOutUser`)

**Add this new function:**
```javascript
// Show user dashboard (redirect to my account page)
function showUserDashboard() {
    window.location.href = 'my-account.html';
}
```

**Insert it right after this function:**
```javascript
function updateUIForLoggedOutUser() {
    const accountLinks = document.querySelectorAll('[href="#account"]');
    accountLinks.forEach(link => {
        link.textContent = 'My Account';
        link.onclick = null;
    });
}

// <-- ADD THE NEW FUNCTION HERE
```

---

### Step 3: Save and Test

1. **Save** `supabase-integration.js`
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Refresh your website**
4. **Try logging in** - should work now!
5. **Try adding to cart** - should work now!

---

## What These Fixes Do

### Fix 1 & 2: Timeout Protection
- Adds 5-second timeout to cart loading
- If cart fails to load, login still succeeds
- Falls back to local cart if database fails
- **Result**: Login/signup no longer freezes!

### Fix 3: Missing Function
- Adds the `showUserDashboard()` function
- Redirects to my-account.html when clicked
- **Result**: No more JavaScript errors!

---

## Testing Checklist

After applying fixes, test these:

- [ ] Click "Account" → "Login" → Enter credentials → Should login successfully
- [ ] Click "Account" → "Sign Up" → Create account → Should signup successfully
- [ ] Click "Add to Cart" on a product → Should add to cart
- [ ] Click cart icon → Click "Checkout" → Should open checkout form
- [ ] Fill checkout form → Click "Place Order" → Should process order

If any of these fail:
1. Open browser console (F12)
2. Look for error messages
3. Make sure you ran FIX_RLS_POLICIES.sql
4. Make sure all 3 JavaScript fixes were applied correctly

---

## Common Issues

### "Still freezing after fixes"
- Did you run FIX_RLS_POLICIES.sql?
- Did you clear browser cache?
- Check browser console for errors

### "Console shows RLS error"
- You didn't run FIX_RLS_POLICIES.sql
- Go run it now!

### "Cannot find function showUserDashboard"
- You didn't apply Fix #3
- Add the function after `updateUIForLoggedOutUser()`

---

## Quick Links

- 🔧 Supabase SQL Editor: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
- 📝 File to edit: `D:\Projects\Figma\outputs\websites\fordips-tech\supabase-integration.js`
- 🔍 RLS Fix: `D:\Projects\Figma\outputs\websites\fordips-tech\FIX_RLS_POLICIES.sql`

---

**After applying all fixes, commit and push the changes to deploy!**
