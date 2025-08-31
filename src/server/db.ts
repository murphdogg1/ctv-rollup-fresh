// Campaign-agnostic database interfaces
export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  created_at: Date;
}

export interface CampaignUpload {
  upload_id: string;
  campaign_id: string;
  filename: string;
  stored_path: string;
  uploaded_at: Date;
}

export interface CampaignContentRaw {
  campaign_id: string;
  campaign_name_src?: string;
  content_title: string;
  content_network_name: string;
  impression: number;
  quartile100: number;
}

export interface ContentAlias {
  content_title_canon: string;
  content_key: string;
  created_at: Date;
}

export interface GenreMap {
  raw_genre: string;
  genre_canon: string;
  created_at: Date;
}

export interface AppRollup {
  campaign_id: string;
  app_name: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
  content_count: number;
}

export interface GenreRollup {
  campaign_id: string;
  genre_canon: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
  content_count: number;
}

export interface ContentRollup {
  campaign_id: string;
  content_key: string;
  content_title: string;
  content_network_name: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
}

// Global storage outside module scope to persist across reloads
declare global {
  var __db_campaigns: Campaign[];
  var __db_campaign_uploads: CampaignUpload[];
  var __db_campaign_content_raw: CampaignContentRaw[];
  var __db_content_aliases: ContentAlias[];
  var __db_genre_map: GenreMap[];
  var __db_initialized: boolean;
}

// Initialize global variables if they don't exist
if (!global.__db_campaigns) {
  global.__db_campaigns = [];
  global.__db_campaign_uploads = [];
  global.__db_campaign_content_raw = [];
  global.__db_content_aliases = [];
  global.__db_genre_map = [];
  global.__db_initialized = false;
}

class InMemoryDatabase {
  constructor() {
    // Use global storage
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      if (!global.__db_initialized) {
        console.log('Initializing campaign-agnostic database...');
        global.__db_initialized = true;
        console.log('Database initialized successfully');
      } else {
        console.log('Database already initialized, reusing existing data');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // Campaign management
  async createCampaign(campaignName: string): Promise<Campaign> {
    if (!global.__db_initialized) {
      throw new Error('Database not yet initialized');
    }
    
    const campaign_id = this.generateCampaignId(campaignName);
    const campaign: Campaign = {
      campaign_id,
      campaign_name: campaignName,
      created_at: new Date()
    };
    global.__db_campaigns.push(campaign);
    console.log(`Created campaign: ${campaignName} with ID: ${campaign_id}`);
    return campaign;
  }

  async getCampaigns(): Promise<Campaign[]> {
    if (!global.__db_initialized) {
      return [];
    }
    console.log(`Returning ${global.__db_campaigns.length} campaigns`);
    return global.__db_campaigns;
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    if (!global.__db_initialized) {
      return null;
    }
    return global.__db_campaigns.find(c => c.campaign_id === campaignId) || null;
  }

  // Upload management
  async createCampaignUpload(
    campaignId: string, 
    filename: string, 
    storedPath: string
  ): Promise<CampaignUpload> {
    if (!global.__db_initialized) {
      throw new Error('Database not yet initialized');
    }
    
    const upload: CampaignUpload = {
      upload_id: this.generateUploadId(),
      campaign_id: campaignId,
      filename,
      stored_path: storedPath,
      uploaded_at: new Date()
    };
    global.__db_campaign_uploads.push(upload);
    console.log(`Created upload for campaign ${campaignId}: ${filename}`);
    return upload;
  }

  async getCampaignUploads(campaignId: string): Promise<CampaignUpload[]> {
    if (!global.__db_initialized) {
      return [];
    }
    return global.__db_campaign_uploads.filter(u => u.campaign_id === campaignId);
  }

  // Content ingestion
  async insertCampaignContent(content: CampaignContentRaw[]): Promise<number> {
    if (!global.__db_initialized) {
      return 0;
    }
    global.__db_campaign_content_raw.push(...content);
    console.log(`Inserted ${content.length} content rows for campaign ${content[0]?.campaign_id}`);
    return content.length;
  }

  // Content normalization
  async upsertContentAlias(contentTitleCanon: string, contentKey: string): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    const existing = global.__db_content_aliases.findIndex(a => a.content_title_canon === contentTitleCanon);
    if (existing >= 0) {
      global.__db_content_aliases[existing].content_key = contentKey;
    } else {
      global.__db_content_aliases.push({
        content_title_canon: contentTitleCanon,
        content_key: contentKey,
        created_at: new Date()
      });
    }
  }

  async upsertGenreMap(rawGenre: string, genreCanon: string): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    const existing = global.__db_genre_map.findIndex(g => g.raw_genre === rawGenre);
    if (existing >= 0) {
      global.__db_genre_map[existing].genre_canon = genreCanon;
    } else {
      global.__db_genre_map.push({
        raw_genre: rawGenre,
        genre_canon: genreCanon,
        created_at: new Date()
      });
    }
  }

  // Rollup generation with improved deduplication and "Other" threshold
  generateAppRollup(campaignId?: string): AppRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId) : 
      global.__db_campaign_content_raw;
    
    const rollupMap = new Map<string, AppRollup>();
    
    for (const content of filtered) {
      // Normalize network name: lowercase and trim for consistent grouping
      const normalizedNetworkName = content.content_network_name?.toLowerCase().trim() || 'Unknown';
      
      // Use normalized name as key to prevent case-sensitive duplicates
      const key = `${content.campaign_id}-${normalizedNetworkName}`;
      
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          app_name: content.content_network_name || 'Unknown', // Keep original name for display
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        });
      }
      
      const rollup = rollupMap.get(key)!;
      rollup.impressions += content.impression || 0;
      rollup.completes += content.quartile100 || 0;
      rollup.content_count += 1;
    }
    
    // Calculate average VCR for each network
    for (const rollup of Array.from(rollupMap.values())) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0;
    }
    
    // Separate networks into significant (>=1000) and others (<1000)
    const significantNetworks: AppRollup[] = [];
    const otherNetworks: AppRollup[] = [];
    
    for (const rollup of Array.from(rollupMap.values())) {
      if (rollup.impressions >= 1000) {
        significantNetworks.push(rollup);
      } else {
        otherNetworks.push(rollup);
      }
    }
    
    // Create "Other" category if there are low-performing networks
    if (otherNetworks.length > 0) {
      const otherRollup: AppRollup = {
        campaign_id: campaignId || 'unknown',
        app_name: 'Other',
        impressions: otherNetworks.reduce((sum, n) => sum + n.impressions, 0),
        completes: otherNetworks.reduce((sum, n) => sum + n.completes, 0),
        avg_vcr: 0,
        content_count: otherNetworks.reduce((sum, n) => sum + n.content_count, 0)
      };
      
      // Calculate VCR for "Other" category
      otherRollup.avg_vcr = otherRollup.impressions > 0 ? 
        Math.round((otherRollup.completes / otherRollup.impressions) * 100 * 100) / 100 : 0;
      
      significantNetworks.push(otherRollup);
    }
    
    // Return sorted by impressions (highest first)
    return significantNetworks.sort((a, b) => b.impressions - a.impressions);
  }

  generateGenreRollup(campaignId?: string): GenreRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId) : 
      global.__db_campaign_content_raw;
    
    const rollupMap = new Map<string, GenreRollup>();
    
    for (const content of filtered) {
      const genreCanon = this.getGenreCanon(content.content_network_name);
      const key = `${content.campaign_id}-${genreCanon}`;
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          genre_canon: genreCanon,
          impressions: 0,
          completes: 0,
          avg_vcr: 0,
          content_count: 0
        });
      }
      
      const rollup = rollupMap.get(key)!;
      rollup.impressions += content.impression || 0;
      rollup.completes += content.quartile100 || 0;
      rollup.content_count += 1;
    }
    
    // Calculate average VCR
    for (const rollup of Array.from(rollupMap.values())) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0;
    }
    
    return Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions);
  }

  generateContentRollup(campaignId?: string): ContentRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId) : 
      global.__db_campaign_content_raw;
    
    const rollupMap = new Map<string, ContentRollup>();
    
    for (const content of filtered) {
      // Handle missing content titles by using network name as fallback
      const contentTitle = content.content_title || `${content.content_network_name} - Unknown Content`;
      const contentKey = this.getContentKey(contentTitle);
      
      // Use normalized network name for consistent grouping
      const normalizedNetworkName = content.content_network_name?.toLowerCase().trim() || 'Unknown';
      const key = `${content.campaign_id}-${contentKey}-${normalizedNetworkName}`;
      
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          content_key: contentKey,
          content_title: contentTitle,
          content_network_name: content.content_network_name || 'Unknown',
          impressions: 0,
          completes: 0,
          avg_vcr: 0
        });
      }
      
      const rollup = rollupMap.get(key)!;
      rollup.impressions += content.impression || 0;
      rollup.completes += content.quartile100 || 0;
    }
    
    // Calculate average VCR
    for (const rollup of Array.from(rollupMap.values())) {
      rollup.avg_vcr = rollup.impressions > 0 ? 
        Math.round((rollup.completes / rollup.impressions) * 100 * 100) / 100 : 0;
    }
    
    return Array.from(rollupMap.values()).sort((a, b) => b.impressions - a.impressions);
  }

  // Utility methods
  private generateCampaignId(campaignName: string): string {
    const slug = campaignName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${slug}-${suffix}`;
  }

  private generateUploadId(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private getContentKey(contentTitle: string): string {
    const contentTitleCanon = contentTitle.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
    const alias = global.__db_content_aliases.find(a => a.content_title_canon === contentTitleCanon);
    return alias?.content_key || contentTitleCanon;
  }

  private getGenreCanon(rawGenre: string): string {
    const genreMap = global.__db_genre_map.find(g => g.raw_genre === rawGenre);
    return genreMap?.genre_canon || 'Unknown';
  }

  // Statistics
  getCampaignStats(campaignId: string) {
    if (!global.__db_initialized) {
      return {
        totalImpressions: 0,
        totalCompletes: 0,
        overallVcr: 0,
        mappedGenres: 0,
        totalGenres: 0,
        mappedPercentage: 0
      };
    }
    
    const filtered = global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId);
    const totalImpressions = filtered.reduce((sum, c) => sum + (c.impression || 0), 0);
    const totalCompletes = filtered.reduce((sum, c) => sum + (c.quartile100 || 0), 0);
    const overallVcr = totalImpressions > 0 ? 
      Math.round((totalCompletes / totalImpressions) * 100 * 100) / 100 : 0;
    const mappedGenres = new Set(filtered.map(c => this.getGenreCanon(c.content_network_name))).size;
    const totalGenres = filtered.length;
    const mappedPercentage = totalGenres > 0 ? 
      Math.round((mappedGenres / totalGenres) * 100) : 0;
    
    return {
      totalImpressions,
      totalCompletes,
      overallVcr,
      mappedGenres,
      totalGenres,
      mappedPercentage
    };
  }

  // Database operations (stubs for compatibility)
  async run(query: string, params: any[] = []): Promise<void> {
    if (!global.__db_initialized) {
      console.log('Database not ready, query ignored:', query);
      return;
    }
    console.log('Executing query:', query, 'with params:', params);
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    if (!global.__db_initialized) {
      console.log('Database not ready, query ignored:', query);
      return [];
    }
    console.log('Query ignored:', query);
      return [];
  }

  async exec(query: string): Promise<void> {
    if (!global.__db_initialized) {
      console.log('Database not ready, query ignored:', query);
      return;
    }
    console.log('Executing query:', query);
  }

  async close(): Promise<void> {
    global.__db_campaigns = [];
    global.__db_campaign_uploads = [];
    global.__db_campaign_content_raw = [];
    global.__db_content_aliases = [];
    global.__db_genre_map = [];
    global.__db_initialized = false;
  }
}

// Create and export a single instance
export const db = new InMemoryDatabase();
