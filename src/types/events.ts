import { z } from 'zod';

// Raw event schema
export const RawEventSchema = z.object({
  event_timestamp: z.string().nullable(),
  app_bundle_raw: z.string().nullable(),
  app_name_raw: z.string().nullable(),
  publisher: z.string().nullable(),
  ssp: z.string().nullable(),
  dsp: z.string().nullable(),
  deal_id: z.string().nullable(),
  exchange_path: z.string().nullable(),
  impression_id: z.string().nullable(),
  request_id: z.string().nullable(),
  device_os: z.string().nullable(),
  device_make: z.string().nullable(),
  country: z.string().nullable(),
  currency: z.string().nullable(),
  price_paid: z.number().nullable(),
  fees_total: z.number().nullable(),
  ad_pod_id: z.string().nullable(),
  ad_break_id: z.string().nullable(),
  ad_position: z.number().nullable(),
  content_id_raw: z.string().nullable(),
  content_title_raw: z.string().nullable(),
  content_episode_raw: z.string().nullable(),
  content_genre_raw: z.string().nullable(),
  channel_name_raw: z.string().nullable(),
  duration_sec: z.number().nullable(),
  vtr: z.number().nullable(),
  viewable: z.boolean().nullable(),
});

export type RawEvent = z.infer<typeof RawEventSchema>;

// Normalized event schema
export const NormalizedEventSchema = RawEventSchema.extend({
  app_bundle: z.string().nullable(),
  app_name: z.string().nullable(),
  publisher_norm: z.string().nullable(),
  app_bundle_status: z.enum(['mapped', 'unmapped']),
  content_title_canon: z.string().nullable(),
  content_key: z.string().nullable(),
  genre_canon: z.string().nullable(),
});

export type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;

// Deduplicated event schema
export const DeduplicatedEventSchema = NormalizedEventSchema.extend({
  dedup_tier: z.number(),
  dedup_reason: z.string(),
});

export type DeduplicatedEvent = z.infer<typeof DeduplicatedEventSchema>;

// Bundle mapping schema
export const BundleMapSchema = z.object({
  raw: z.string(),
  app_bundle: z.string(),
  app_name: z.string(),
  publisher: z.string(),
  mask_reason: z.string().nullable(),
});

export type BundleMap = z.infer<typeof BundleMapSchema>;

// Genre mapping schema
export const GenreMapSchema = z.object({
  raw: z.string(),
  genre_canon: z.string(),
});

export type GenreMap = z.infer<typeof GenreMapSchema>;

// Content aliases schema
export const ContentAliasSchema = z.object({
  content_title_canon: z.string(),
  content_key: z.string(),
});

export type ContentAlias = z.infer<typeof ContentAliasSchema>;

// Rollup schemas
export const AppRollupSchema = z.object({
  app_bundle: z.string().nullable(),
  app_name: z.string().nullable(),
  impressions: z.number(),
  spend: z.number().nullable(),
  avg_vtr: z.number().nullable(),
  viewable_rate: z.number().nullable(),
  unique_ssps: z.number(),
  unique_dsps: z.number(),
  unique_deal_paths: z.number(),
});

export type AppRollup = z.infer<typeof AppRollupSchema>;

export const GenreRollupSchema = z.object({
  genre_canon: z.string().nullable(),
  impressions: z.number(),
  spend: z.number().nullable(),
  avg_vtr: z.number().nullable(),
  viewable_rate: z.number().nullable(),
  unique_ssps: z.number(),
  unique_dsps: z.number(),
  unique_deal_paths: z.number(),
});

export type GenreRollup = z.infer<typeof GenreRollupSchema>;

export const ContentRollupSchema = z.object({
  content_key: z.string().nullable(),
  content_title_canon: z.string().nullable(),
  app_bundle: z.string().nullable(),
  impressions: z.number(),
  spend: z.number().nullable(),
  avg_vtr: z.number().nullable(),
  viewable_rate: z.number().nullable(),
  unique_ssps: z.number(),
  unique_dsps: z.number(),
  unique_deal_paths: z.number(),
});

export type ContentRollup = z.infer<typeof ContentRollupSchema>;

// API response schemas
export const IngestResponseSchema = z.object({
  success: z.boolean(),
  rowsInserted: z.number(),
  detectedColumns: z.array(z.string()),
  sampleRows: z.array(RawEventSchema),
  warnings: z.array(z.string()).optional(),
});

export type IngestResponse = z.infer<typeof IngestResponseSchema>;

export const StatusResponseSchema = z.object({
  connected: z.boolean(),
  engine: z.string(),
  rowCounts: z.object({
    raw_events: z.number(),
    bundle_map: z.number(),
    genre_map: z.number(),
    content_aliases: z.number(),
  }),
});

export type StatusResponse = z.infer<typeof StatusResponseSchema>;
