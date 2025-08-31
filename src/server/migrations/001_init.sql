-- Create raw_events table
CREATE TABLE IF NOT EXISTS raw_events (
  event_timestamp TIMESTAMP,
  app_bundle_raw TEXT,
  app_name_raw TEXT,
  publisher TEXT,
  ssp TEXT,
  dsp TEXT,
  deal_id TEXT,
  exchange_path TEXT,
  impression_id TEXT,
  request_id TEXT,
  device_os TEXT,
  device_make TEXT,
  country TEXT,
  currency TEXT,
  price_paid DOUBLE,
  fees_total DOUBLE,
  ad_pod_id TEXT,
  ad_break_id TEXT,
  ad_position INTEGER,
  content_id_raw TEXT,
  content_title_raw TEXT,
  content_episode_raw TEXT,
  content_genre_raw TEXT,
  channel_name_raw TEXT,
  duration_sec INTEGER,
  vtr DOUBLE,
  viewable BOOLEAN
);

-- Create bundle_map table
CREATE TABLE IF NOT EXISTS bundle_map (
  raw TEXT PRIMARY KEY,
  app_bundle TEXT,
  app_name TEXT,
  publisher TEXT,
  mask_reason TEXT
);

-- Create genre_map table
CREATE TABLE IF NOT EXISTS genre_map (
  raw TEXT PRIMARY KEY,
  genre_canon TEXT
);

-- Create content_aliases table
CREATE TABLE IF NOT EXISTS content_aliases (
  content_title_canon TEXT PRIMARY KEY,
  content_key TEXT
);

-- Create events_norm view
CREATE OR REPLACE VIEW events_norm AS
SELECT
  r.*,
  bm.app_bundle AS app_bundle,
  bm.app_name AS app_name,
  COALESCE(bm.publisher, r.publisher) AS publisher_norm,
  CASE WHEN bm.app_bundle IS NULL THEN 'unmapped' ELSE 'mapped' END AS app_bundle_status,
  LOWER(REGEXP_REPLACE(TRIM(r.content_title_raw), '[^\\w ]','')) AS content_title_canon,
  COALESCE(r.content_id_raw, ca.content_key, LOWER(REGEXP_REPLACE(TRIM(r.content_title_raw), '[^\\w ]',''))) AS content_key,
  COALESCE(gm.genre_canon, r.content_genre_raw) AS genre_canon
FROM raw_events r
LEFT JOIN bundle_map bm ON r.app_bundle_raw = bm.raw
LEFT JOIN genre_map gm ON r.content_genre_raw = gm.raw
LEFT JOIN content_aliases ca ON LOWER(REGEXP_REPLACE(TRIM(r.content_title_raw), '[^\\w ]','')) = ca.content_title_canon;

-- Create events_dedup view
CREATE OR REPLACE VIEW events_dedup AS
WITH t AS (
  SELECT e.*,
    CASE
      WHEN impression_id IS NOT NULL THEN 1
      WHEN request_id IS NOT NULL AND ad_break_id IS NOT NULL AND ad_position IS NOT NULL THEN 2
      ELSE 3
    END AS dedup_tier,
    DATE_TRUNC('second', event_timestamp) AS ts_s
  FROM events_norm e
),
ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY
        CASE WHEN dedup_tier=1 THEN impression_id END,
        CASE WHEN dedup_tier=2 THEN request_id END,
        CASE WHEN dedup_tier=2 THEN ad_break_id END,
        CASE WHEN dedup_tier=2 THEN ad_position END,
        CASE WHEN dedup_tier=2 THEN ts_s END,
        CASE WHEN dedup_tier=3 THEN app_bundle END,
        CASE WHEN dedup_tier=3 THEN content_key END,
        CASE WHEN dedup_tier=3 THEN deal_id END,
        CASE WHEN dedup_tier=3 THEN ssp END,
        CASE WHEN dedup_tier=3 THEN dsp END,
        CASE WHEN dedup_tier=3 THEN ad_break_id END,
        CASE WHEN dedup_tier=3 THEN ad_position END,
        CASE WHEN dedup_tier=3 THEN ts_s END
      ORDER BY (impression_id IS NULL), (price_paid IS NULL), price_paid DESC, event_timestamp DESC
    ) AS rn
  FROM t
)
SELECT *,
  CASE dedup_tier
    WHEN 1 THEN 'exact_impression_id'
    WHEN 2 THEN 'request_break_position_time'
    ELSE 'composite_app_content_deal_path_time'
  END AS dedup_reason
FROM ranked
WHERE rn=1;

-- Create rollup_app view
CREATE OR REPLACE VIEW rollup_app AS
SELECT
  app_bundle,
  app_name,
  COUNT(*) AS impressions,
  SUM(price_paid) AS spend,
  AVG(vtr) AS avg_vtr,
  AVG(CASE WHEN viewable THEN 1 ELSE 0 END) AS viewable_rate,
  COUNT(DISTINCT ssp) AS unique_ssps,
  COUNT(DISTINCT dsp) AS unique_dsps,
  COUNT(DISTINCT deal_id) AS unique_deal_paths
FROM events_dedup
GROUP BY app_bundle, app_name
ORDER BY spend DESC NULLS LAST;

-- Create rollup_genre view
CREATE OR REPLACE VIEW rollup_genre AS
SELECT
  genre_canon,
  COUNT(*) AS impressions,
  SUM(price_paid) AS spend,
  AVG(vtr) AS avg_vtr,
  AVG(CASE WHEN viewable THEN 1 ELSE 0 END) AS viewable_rate,
  COUNT(DISTINCT ssp) AS unique_ssps,
  COUNT(DISTINCT dsp) AS unique_dsps,
  COUNT(DISTINCT deal_id) AS unique_deal_paths
FROM events_dedup
GROUP BY genre_canon
ORDER BY spend DESC NULLS LAST;

-- Create rollup_content view
CREATE OR REPLACE VIEW rollup_content AS
SELECT
  content_key,
  content_title_canon,
  app_bundle,
  COUNT(*) AS impressions,
  SUM(price_paid) AS spend,
  AVG(vtr) AS avg_vtr,
  AVG(CASE WHEN viewable THEN 1 ELSE 0 END) AS viewable_rate,
  COUNT(DISTINCT ssp) AS unique_ssps,
  COUNT(DISTINCT dsp) AS unique_dsps,
  COUNT(DISTINCT deal_id) AS unique_deal_paths
FROM events_dedup
GROUP BY content_key, content_title_canon, app_bundle
ORDER BY spend DESC NULLS LAST;
