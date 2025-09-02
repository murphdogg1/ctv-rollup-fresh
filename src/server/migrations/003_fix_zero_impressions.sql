-- Migration 003: Fix zero impressions in rollup views
-- Update campaign_content_clean view to filter out rows with zero impressions

CREATE OR REPLACE VIEW campaign_content_clean AS
SELECT 
  campaign_id,
  content_title,
  content_network_name,
  SUM(impression) as total_impressions,
  SUM(quartile100) as total_completes,
  COUNT(*) as row_count
FROM campaign_content_raw
WHERE impression > 0  -- Filter out rows with zero impressions
GROUP BY campaign_id, content_title, content_network_name;

-- The other views (campaign_content_norm, campaign_content_genred, and rollup views) 
-- will automatically inherit this fix since they depend on campaign_content_clean
