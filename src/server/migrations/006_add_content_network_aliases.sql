-- Create content_network_aliases table
CREATE TABLE IF NOT EXISTS content_network_aliases (
  id SERIAL PRIMARY KEY,
  alias TEXT NOT NULL,
  network_names TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_network_aliases_alias ON content_network_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_content_network_aliases_network_names ON content_network_aliases USING GIN(network_names);

-- Function to get mapped network name
CREATE OR REPLACE FUNCTION get_mapped_network_name(network_name TEXT)
RETURNS TEXT AS $$
DECLARE
  mapped_name TEXT;
BEGIN
  SELECT alias INTO mapped_name
  FROM content_network_aliases
  WHERE network_name = ANY(network_names)
  LIMIT 1;
  
  RETURN COALESCE(mapped_name, network_name);
END;
$$ LANGUAGE plpgsql;

-- Update rr_rollup_app view to use mapped network names
CREATE OR REPLACE VIEW rr_rollup_app AS
SELECT 
  campaign_id,
  get_mapped_network_name(content_network_name) as app_name,
  SUM(impression)::bigint as impressions,
  SUM(quartile100)::bigint as completes,
  CASE 
    WHEN SUM(impression) > 0 THEN 
      ROUND((SUM(quartile100)::numeric / SUM(impression)::numeric) * 100, 2)
    ELSE 0 
  END as avg_vcr,
  COUNT(*)::bigint as content_count
FROM campaign_content_raw
WHERE impression > 0
GROUP BY campaign_id, get_mapped_network_name(content_network_name)
ORDER BY impressions DESC;
