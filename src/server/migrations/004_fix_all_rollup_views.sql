-- Migration 004: Fix all rollup views to filter out zero impressions
-- This updates all rollup views directly to ensure zero impressions are filtered

-- First, update the campaign_content_clean view
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

-- Update the app rollup view directly
CREATE OR REPLACE VIEW rr_rollup_app AS
SELECT 
  campaign_id,
  content_network_name as app_name,
  SUM(total_impressions) as impressions,
  SUM(total_completes) as completes,
  CASE 
    WHEN SUM(total_impressions) > 0 THEN ROUND((SUM(total_completes) * 100.0 / SUM(total_impressions)), 2)
    ELSE 0 
  END as avg_vcr,
  COUNT(*) as content_count
FROM campaign_content_clean
WHERE total_impressions > 0  -- Double-check: only include rows with impressions > 0
GROUP BY campaign_id, content_network_name
ORDER BY campaign_id, impressions DESC;

-- Update the genre rollup view directly
CREATE OR REPLACE VIEW rr_rollup_genre AS
SELECT 
  campaign_id,
  'Unknown' as genre_canon,
  SUM(total_impressions) as impressions,
  SUM(total_completes) as completes,
  CASE 
    WHEN SUM(total_impressions) > 0 THEN ROUND((SUM(total_completes) * 100.0 / SUM(total_impressions)), 2)
    ELSE 0 
  END as avg_vcr,
  COUNT(*) as content_count
FROM campaign_content_clean
WHERE total_impressions > 0  -- Double-check: only include rows with impressions > 0
GROUP BY campaign_id
ORDER BY campaign_id, impressions DESC;

-- Update the content rollup view directly
CREATE OR REPLACE VIEW rr_rollup_content AS
SELECT 
  campaign_id,
  content_title as content_key,
  content_title,
  content_network_name,
  SUM(total_impressions) as impressions,
  SUM(total_completes) as completes,
  CASE 
    WHEN SUM(total_impressions) > 0 THEN ROUND((SUM(total_completes) * 100.0 / SUM(total_impressions)), 2)
    ELSE 0 
  END as avg_vcr
FROM campaign_content_clean
WHERE total_impressions > 0  -- Double-check: only include rows with impressions > 0
GROUP BY campaign_id, content_title, content_network_name
ORDER BY campaign_id, impressions DESC;
