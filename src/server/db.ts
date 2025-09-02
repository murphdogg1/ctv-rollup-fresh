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

export interface ContentNetworkAlias {
  alias: string;
  network_names: string[];
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
  var __db_content_network_aliases: ContentNetworkAlias[];
  var __db_initialized: boolean;
}

// Initialize global variables if they don't exist
if (!global.__db_campaigns) {
  global.__db_campaigns = [];
  global.__db_campaign_uploads = [];
  global.__db_campaign_content_raw = [];
  global.__db_content_aliases = [];
  global.__db_genre_map = [];
  global.__db_content_network_aliases = [];
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
    const campaigns = global.__db_campaigns.map(campaign => ({ campaign_id: campaign.campaign_id, campaign_name: campaign.campaign_name, created_at: campaign.created_at })); return campaigns as Campaign[];
  }

  async getCampaign(campaignId: string): Promise<Campaign | null> {
    if (!global.__db_initialized) {
      return null;
    }
    return global.__db_campaigns.find(c => c.campaign_id === campaignId) || null;
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    if (!global.__db_initialized) {
      throw new Error('Database not yet initialized');
    }
    
    // Remove campaign from campaigns array
    const campaignIndex = global.__db_campaigns.findIndex(c => c.campaign_id === campaignId);
    if (campaignIndex >= 0) {
      global.__db_campaigns.splice(campaignIndex, 1);
    }
    
    // Remove related uploads
    global.__db_campaign_uploads = global.__db_campaign_uploads.filter(u => u.campaign_id !== campaignId);
    
    // Remove related content
    global.__db_campaign_content_raw = global.__db_campaign_content_raw.filter(c => c.campaign_id !== campaignId);
    
    console.log(`Deleted campaign ${campaignId} and all related data`);
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

  async getCampaignContent(campaignId: string): Promise<CampaignContentRaw[]> {
    if (!global.__db_initialized) {
      return [];
    }
    return global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId);
  }

  // Content Network Management
  async getContentNetworkNames(campaignId?: string): Promise<string[]> {
    if (!global.__db_initialized) {
      return [];
    }
    
    let content = global.__db_campaign_content_raw
    
    if (campaignId) {
      content = content.filter(c => c.campaign_id === campaignId)
    }
    
    const uniqueNames = [...new Set(content.map(c => c.content_network_name))]
    return uniqueNames.filter(name => name && name.trim() !== '').sort()
  }

  async getContentNetworkAliases(): Promise<{alias: string, network_names: string[]}[]> {
    if (!global.__db_initialized) {
      return [];
    }
    
    return global.__db_content_network_aliases.map(alias => ({
      alias: alias.alias,
      network_names: alias.network_names
    }))
  }

  async createContentNetworkAlias(alias: string, networkNames: string[]): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    // Remove existing alias with same name
    global.__db_content_network_aliases = global.__db_content_network_aliases.filter(a => a.alias !== alias)
    
    // Add new alias
    global.__db_content_network_aliases.push({
      alias,
      network_names: networkNames,
      created_at: new Date()
    })
  }

  async deleteContentNetworkAlias(alias: string): Promise<void> {
    if (!global.__db_initialized) {
      return;
    }
    
    global.__db_content_network_aliases = global.__db_content_network_aliases.filter(a => a.alias !== alias)
  }

  getMappedNetworkName(networkName: string): string {
    if (!global.__db_initialized) {
      return networkName;
    }
    
    const alias = global.__db_content_network_aliases.find(a => 
      a.network_names.includes(networkName)
    );
    
    return alias ? alias.alias : networkName;
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
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId && (c.impression || 0) > 0) : 
      global.__db_campaign_content_raw.filter(c => (c.impression || 0) > 0);
    
    const rollupMap = new Map<string, AppRollup>();
    // Accumulator for the "Other" bucket
    const otherAccumulator: AppRollup = {
      campaign_id: campaignId || 'unknown',
      app_name: 'Other',
      impressions: 0,
      completes: 0,
      avg_vcr: 0,
      content_count: 0
    };
    
    for (const content of filtered) {
      const originalNetworkName = content.content_network_name || 'Unknown';
      const mappedNetworkName = this.getMappedNetworkName(originalNetworkName);
      const isAliased = mappedNetworkName !== originalNetworkName;

      // Rule: if NOT aliased and impressions < 50, bucket into "Other"
      if (!isAliased && (content.impression || 0) < 50) {
        otherAccumulator.impressions += content.impression || 0;
        otherAccumulator.completes += content.quartile100 || 0;
        otherAccumulator.content_count += 1;
        continue;
      }

      const normalizedNetworkName = mappedNetworkName.toLowerCase().trim();
      const key = `${content.campaign_id}-${normalizedNetworkName}`;
      if (!rollupMap.has(key)) {
        rollupMap.set(key, {
          campaign_id: content.campaign_id,
          app_name: mappedNetworkName,
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

    const results = Array.from(rollupMap.values());
    // Add Other if it has any impressions
    if (otherAccumulator.impressions > 0) {
      otherAccumulator.avg_vcr = Math.round(
        (otherAccumulator.completes / otherAccumulator.impressions) * 100 * 100
      ) / 100;
      results.push(otherAccumulator);
    }

    // Return sorted by impressions (highest first)
    return results.sort((a, b) => b.impressions - a.impressions);
  }

  generateGenreRollup(campaignId?: string): GenreRollup[] {
    if (!global.__db_initialized) {
      return [];
    }
    
    const filtered = campaignId ? 
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId && (c.impression || 0) > 0) : 
      global.__db_campaign_content_raw.filter(c => (c.impression || 0) > 0);
    
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
      global.__db_campaign_content_raw.filter(c => c.campaign_id === campaignId && (c.impression || 0) > 0) : 
      global.__db_campaign_content_raw.filter(c => (c.impression || 0) > 0);
    
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
      const typedCampaign = {
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
    
    const typedCampaign = {
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
    global.__db_content_network_aliases = [];
    global.__db_initialized = false;
  }
}

// Create and export a single instance
export const db = new InMemoryDatabase();
