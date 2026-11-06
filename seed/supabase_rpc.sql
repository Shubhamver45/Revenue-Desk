-- ============================================================
-- Revenue Desk — Supabase RPC Endpoint for HTTPS SQL Execution
-- Allows the Analyst & Reviewer agents to query Supabase live via REST
-- ============================================================

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || query || ') t' INTO result;
    RETURN result;
END;
$$;

-- Grant execution permissions to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon, authenticated, service_role;


