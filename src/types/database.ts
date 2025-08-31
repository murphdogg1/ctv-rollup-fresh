export interface Campaign {
  campaign_id: string
  campaign_name: string
  created_at: string
}

export interface CampaignUpload {
  upload_id: string
  campaign_id: string
  file_name: string
  stored_path: string
  uploaded_at: string
}

export interface CampaignContentRaw {
  campaign_id: string
  campaign_name_src?: string
  content_title: string
  content_network_name: string
  impression: number
  quartile100: number
}

export interface ContentAlias {
  id: string
  content_title_canon: string
  content_key: string
  created_at: string
}

export interface GenreMap {
  id: string
  raw_genre: string
  genre_canon: string
  created_at: string
}

export interface AppRollup {
  campaign_id: string
  app_name: string
  impressions: number
  completes: number
  avg_vcr: number
  content_count: number
}

export interface GenreRollup {
  campaign_id: string
  genre_canon: string
  impressions: number
  completes: number
  avg_vcr: number
  content_count: number
}

export interface ContentRollup {
  campaign_id: string
  content_key: string
  content_title: string
  content_network_name: string
  impressions: number
  completes: number
  avg_vcr: number
}
