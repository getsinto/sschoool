-- NUCLEAR OPTION: Find and destroy ALL triggers on auth.users
-- This will find triggers with ANY name and remove them

DO $$
DECLARE
    trigger_record RECORD;
    function_record RECORD;
BEGIN
    -- Find ALL triggers on auth.users table
    FOR trigger_record IN 
        SELECT 
            t.tgname as trigger_name,
            c.relname as table_name,
            n.nspname as schema_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'users' 
        AND n.nspname = 'auth'
        AND NOT t.tgisinternal
    LOOP
        -- Drop each trigger found
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
                      trigger_record.trigger_name, 
                      trigger_record.schema_name, 
                      trigger_record.table_name);
        
        RAISE NOTICE 'DESTROYED TRIGGER: % on %.%', 
                     trigger_record.trigger_name, 
                     trigger_record.schema_name, 
                     trigger_record.table_name;
    END LOOP;
    
    -- Find and drop ALL functions that might be creating profiles
    FOR function_record IN
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname ILIKE '%user%'
        OR p.proname ILIKE '%profile%'
        OR p.proname ILIKE '%handle%'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
                          function_record.schema_name,
                          function_record.function_name,
                          function_record.args);
            RAISE NOTICE 'DESTROYED FUNCTION: %.%(%)', 
                         function_record.schema_name,
                         function_record.function_name,
                         function_record.args;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop function %.%: %', 
                         function_record.schema_name,
                         function_record.function_name,
                         SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'NUCLEAR CLEANUP COMPLETE!';
END $$;

-- Verify no triggers remain
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    'STILL EXISTS!' as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'users' 
AND n.nspname = 'auth'
AND NOT t.tgisinternal;
