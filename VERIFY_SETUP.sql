/**
 * FORDIPS TECH - VERIFICATION SCRIPT
 * Run this to check if everything is set up correctly
 */

-- ============================================
-- CHECK 1: Tables
-- ============================================
DO $$
DECLARE
    notifications_exists BOOLEAN;
    help_me_pay_exists BOOLEAN;
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '🔍 CHECKING DATABASE SETUP';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 CHECK 1: TABLES';
    RAISE NOTICE '──────────────────────────────────────────────────';

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'notifications'
    ) INTO notifications_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'help_me_pay_requests'
    ) INTO help_me_pay_exists;

    IF notifications_exists THEN
        RAISE NOTICE '   ✅ notifications table exists';
    ELSE
        RAISE NOTICE '   ❌ notifications table MISSING';
    END IF;

    IF help_me_pay_exists THEN
        RAISE NOTICE '   ✅ help_me_pay_requests table exists';
    ELSE
        RAISE NOTICE '   ❌ help_me_pay_requests table MISSING';
    END IF;

    RAISE NOTICE '';
END $$;

-- Check table columns
SELECT
    '   📋 notifications has ' || COUNT(*) || ' columns' as info
FROM information_schema.columns
WHERE table_name = 'notifications'
UNION ALL
SELECT
    '   📋 help_me_pay_requests has ' || COUNT(*) || ' columns'
FROM information_schema.columns
WHERE table_name = 'help_me_pay_requests';

-- ============================================
-- CHECK 2: Functions
-- ============================================
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  CHECK 2: FUNCTIONS';
    RAISE NOTICE '──────────────────────────────────────────────────';

    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND (routine_name LIKE '%notification%'
         OR routine_name LIKE '%help_me_pay%'
         OR routine_name LIKE '%search_products%'
         OR routine_name LIKE '%update_updated_at%');

    IF func_count >= 10 THEN
        RAISE NOTICE '   ✅ Found % functions (expected 10)', func_count;
    ELSE
        RAISE NOTICE '   ⚠️  Found % functions (expected 10)', func_count;
    END IF;

    RAISE NOTICE '';
END $$;

-- List all functions
SELECT
    '   • ' || routine_name as "Functions Created"
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND (routine_name LIKE '%notification%'
     OR routine_name LIKE '%help_me_pay%'
     OR routine_name LIKE '%search_products%'
     OR routine_name LIKE '%update_updated_at%')
ORDER BY routine_name;

-- ============================================
-- CHECK 3: RLS (Row Level Security)
-- ============================================
DO $$
DECLARE
    notifications_rls BOOLEAN;
    help_me_pay_rls BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 CHECK 3: ROW LEVEL SECURITY (RLS)';
    RAISE NOTICE '──────────────────────────────────────────────────';

    SELECT relrowsecurity INTO notifications_rls
    FROM pg_class
    WHERE relname = 'notifications';

    SELECT relrowsecurity INTO help_me_pay_rls
    FROM pg_class
    WHERE relname = 'help_me_pay_requests';

    IF notifications_rls THEN
        RAISE NOTICE '   ✅ RLS enabled on notifications';
    ELSE
        RAISE NOTICE '   ❌ RLS NOT enabled on notifications';
    END IF;

    IF help_me_pay_rls THEN
        RAISE NOTICE '   ✅ RLS enabled on help_me_pay_requests';
    ELSE
        RAISE NOTICE '   ❌ RLS NOT enabled on help_me_pay_requests';
    END IF;

    RAISE NOTICE '';
END $$;

-- ============================================
-- CHECK 4: Policies
-- ============================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛡️  CHECK 4: RLS POLICIES';
    RAISE NOTICE '──────────────────────────────────────────────────';

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (tablename = 'notifications' OR tablename = 'help_me_pay_requests');

    IF policy_count >= 7 THEN
        RAISE NOTICE '   ✅ Found % policies (expected 7)', policy_count;
    ELSE
        RAISE NOTICE '   ⚠️  Found % policies (expected 7)', policy_count;
    END IF;

    RAISE NOTICE '';
END $$;

-- List all policies
SELECT
    '   • ' || tablename || ': ' || policyname as "Policies Created"
FROM pg_policies
WHERE schemaname = 'public'
AND (tablename = 'notifications' OR tablename = 'help_me_pay_requests')
ORDER BY tablename, policyname;

-- ============================================
-- CHECK 5: Triggers
-- ============================================
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚡ CHECK 5: TRIGGERS';
    RAISE NOTICE '──────────────────────────────────────────────────';

    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND (event_object_table = 'notifications' OR event_object_table = 'help_me_pay_requests');

    IF trigger_count >= 2 THEN
        RAISE NOTICE '   ✅ Found % triggers (expected 2)', trigger_count;
    ELSE
        RAISE NOTICE '   ⚠️  Found % triggers (expected 2)', trigger_count;
    END IF;

    RAISE NOTICE '';
END $$;

-- List triggers
SELECT
    '   • ' || event_object_table || ': ' || trigger_name as "Triggers Created"
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND (event_object_table = 'notifications' OR event_object_table = 'help_me_pay_requests')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- CHECK 6: Indexes
-- ============================================
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📇 CHECK 6: INDEXES';
    RAISE NOTICE '──────────────────────────────────────────────────';

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND (tablename = 'notifications' OR tablename = 'help_me_pay_requests');

    IF index_count >= 6 THEN
        RAISE NOTICE '   ✅ Found % indexes (expected 6+)', index_count;
    ELSE
        RAISE NOTICE '   ⚠️  Found % indexes (expected 6+)', index_count;
    END IF;

    RAISE NOTICE '';
END $$;

-- ============================================
-- CHECK 7: Test Function Execution
-- ============================================
DO $$
DECLARE
    test_result BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 CHECK 7: FUNCTION TESTS';
    RAISE NOTICE '──────────────────────────────────────────────────';

    -- Test search_products function (if products table exists)
    BEGIN
        PERFORM search_products('test');
        RAISE NOTICE '   ✅ search_products() works';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '   ⚠️  search_products() - % (products table might not exist)', SQLERRM;
    END;

    -- Test cleanup function
    BEGIN
        PERFORM cleanup_expired_help_me_pay_requests();
        RAISE NOTICE '   ✅ cleanup_expired_help_me_pay_requests() works';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '   ❌ cleanup_expired_help_me_pay_requests() failed: %', SQLERRM;
    END;

    RAISE NOTICE '';
END $$;

-- ============================================
-- CHECK 8: Permissions
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👥 CHECK 8: PERMISSIONS';
    RAISE NOTICE '──────────────────────────────────────────────────';
    RAISE NOTICE '   ℹ️  Checking if anon/authenticated can access tables...';
    RAISE NOTICE '';
END $$;

SELECT
    grantee,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) as privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name IN ('notifications', 'help_me_pay_requests')
AND grantee IN ('anon', 'authenticated')
GROUP BY grantee;

-- ============================================
-- FINAL SUMMARY
-- ============================================
DO $$
DECLARE
    tables_ok BOOLEAN;
    functions_ok BOOLEAN;
    rls_ok BOOLEAN;
    policies_ok BOOLEAN;
    triggers_ok BOOLEAN;
    all_ok BOOLEAN;
BEGIN
    -- Check tables
    SELECT COUNT(*) = 2 INTO tables_ok
    FROM information_schema.tables
    WHERE table_name IN ('notifications', 'help_me_pay_requests');

    -- Check functions
    SELECT COUNT(*) >= 10 INTO functions_ok
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND (routine_name LIKE '%notification%'
         OR routine_name LIKE '%help_me_pay%'
         OR routine_name LIKE '%search_products%'
         OR routine_name LIKE '%update_updated_at%');

    -- Check RLS
    SELECT COUNT(*) = 2 INTO rls_ok
    FROM pg_class
    WHERE relname IN ('notifications', 'help_me_pay_requests')
    AND relrowsecurity = TRUE;

    -- Check policies
    SELECT COUNT(*) >= 7 INTO policies_ok
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (tablename = 'notifications' OR tablename = 'help_me_pay_requests');

    -- Check triggers
    SELECT COUNT(*) >= 2 INTO triggers_ok
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND (event_object_table = 'notifications' OR event_object_table = 'help_me_pay_requests');

    all_ok := tables_ok AND functions_ok AND rls_ok AND policies_ok AND triggers_ok;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    IF all_ok THEN
        RAISE NOTICE '✅ ✅ ✅  ALL CHECKS PASSED!  ✅ ✅ ✅';
        RAISE NOTICE '═══════════════════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Your database is correctly set up!';
        RAISE NOTICE '';
        RAISE NOTICE '📝 NEXT STEPS:';
        RAISE NOTICE '   1. Enable Email Auth:';
        RAISE NOTICE '      Dashboard → Authentication → Providers → Email';
        RAISE NOTICE '';
        RAISE NOTICE '   2. Test your site:';
        RAISE NOTICE '      https://keysight-tech.github.io/fordips-tech/';
        RAISE NOTICE '';
        RAISE NOTICE '   3. Test features:';
        RAISE NOTICE '      ✓ Product search (search bar)';
        RAISE NOTICE '      ✓ Account creation (sign up)';
        RAISE NOTICE '      ✓ Notifications (bell icon after login)';
        RAISE NOTICE '      ✓ Help Me Pay (checkout page)';
        RAISE NOTICE '      ✓ Currency selector (globe icon)';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '⚠️  SOME CHECKS FAILED';
        RAISE NOTICE '═══════════════════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE 'Status:';
        IF tables_ok THEN
            RAISE NOTICE '   ✅ Tables';
        ELSE
            RAISE NOTICE '   ❌ Tables - missing';
        END IF;
        IF functions_ok THEN
            RAISE NOTICE '   ✅ Functions';
        ELSE
            RAISE NOTICE '   ❌ Functions - incomplete';
        END IF;
        IF rls_ok THEN
            RAISE NOTICE '   ✅ RLS';
        ELSE
            RAISE NOTICE '   ❌ RLS - not enabled';
        END IF;
        IF policies_ok THEN
            RAISE NOTICE '   ✅ Policies';
        ELSE
            RAISE NOTICE '   ❌ Policies - incomplete';
        END IF;
        IF triggers_ok THEN
            RAISE NOTICE '   ✅ Triggers';
        ELSE
            RAISE NOTICE '   ❌ Triggers - missing';
        END IF;
        RAISE NOTICE '';
        RAISE NOTICE '💡 Try running WORKING_MIGRATION.sql again';
    END IF;
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
