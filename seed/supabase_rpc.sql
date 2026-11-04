-- ============================================================
-- Revenue Desk — Supabase RPC Endpoint for HTTPS SQL Execution
-- Allows the Analyst & Reviewer agents to query Supabase live via REST
-- ============================================================

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || query || ') t' INTO result;
    RETURN result;
END;
$$;
