'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, TrendingUp, Eye, Calendar, Upload, BarChart, Tag, Film, FileText, Database } from 'lucide-react';

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  created_at: string;
  stats?: {
    totalLines: number;
    rollupLines: number;
    uploads: number;
  };
}

interface DashboardStats {
  totalCampaigns: number;
  totalImpressions: number;
  totalCompletes: number;
  overallVCR: number;
  recentCampaigns: Campaign[];
}

export default function DashboardClient() {
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    totalImpressions: 0,
    totalCompletes: 0,
    overallVCR: 0,
    recentCampaigns: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('Testing...');

  useEffect(() => {
    setIsClient(true);
    console.log('DashboardClient: JavaScript is executing!');
    
    // Test API connection first
    fetch('/api/campaigns')
      .then(response => response.json())
      .then(data => {
        console.log('API call successful:', data);
        setApiStatus(`Connected! Found ${data.campaigns?.length || 0} campaigns`);
        fetchDashboardStats();
      })
      .catch(error => {
        console.error('API call failed:', error);
        setApiStatus(`Failed: ${error.message}`);
        setIsLoading(false);
      });
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch campaigns
      const campaignsResponse = await fetch('/api/campaigns');
      const campaignsData = await campaignsResponse.json();
      
      if (campaignsData.success) {
        const campaigns = campaignsData.campaigns;
        const totalCampaigns = campaigns.length;
        
        // Get recent campaigns (last 5)
        const recentCampaigns = campaigns
          .sort((a: Campaign, b: Campaign) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        // Calculate totals from all campaigns
        let totalImpressions = 0;
        let totalCompletes = 0;
        
        // Fetch rollup data for each campaign to get totals
        for (const campaign of campaigns) {
          try {
            const appResponse = await fetch(`/api/campaigns/${campaign.campaign_id}/rollup/app`);
            const appData = await appResponse.json();
            
            if (appData.success && appData.rollup) {
              for (const rollup of appData.rollup) {
                totalImpressions += rollup.impressions || 0;
                totalCompletes += rollup.completes || 0;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch data for campaign ${campaign.campaign_id}:`, error);
          }
        }
        
        const overallVCR = totalImpressions > 0 ? 
          Math.round((totalCompletes / totalImpressions) * 100 * 100) / 100 : 0;
        
        setStats({
          totalCampaigns,
          totalImpressions,
          totalCompletes,
          overallVCR,
          recentCampaigns
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="mt-2 text-xs text-blue-600">
        API Status: {apiStatus}
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalCampaigns.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalImpressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalCompletes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Video completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall VCR</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${stats.overallVCR}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Video completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Campaigns</CardTitle>
            <CardDescription>
              Upload new CSV files and manage existing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/campaigns">
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Go to Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Networks</CardTitle>
            <CardDescription>
              Manage content network aliases for cleaner rollups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/content-networks">
              <Button className="w-full">
                <Tag className="w-4 h-4 mr-2" />
                Content Networks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Composition</CardTitle>
            <CardDescription>
              Treemap of content networks by impressions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/inventory">
              <Button className="w-full">
                <BarChart className="w-4 h-4 mr-2" />
                Inventory Composition
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              Latest campaigns added to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading campaigns...
              </div>
            ) : stats.recentCampaigns.length > 0 ? (
              stats.recentCampaigns.map((campaign) => (
                <div key={campaign.campaign_id} className="p-3 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{campaign.campaign_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(campaign.created_at)}
                      </p>
                    </div>
                    <Link href={`/campaigns/${campaign.campaign_id}/reports`}>
                      <Button variant="outline" size="sm">
                        View Reports
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Statistics for recent campaigns */}
                  {campaign.stats && (
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1 text-blue-600">
                        <FileText className="w-3 h-3" />
                        <span>{campaign.stats.totalLines.toLocaleString()} lines</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Database className="w-3 h-3" />
                        <span>{campaign.stats.rollupLines.toLocaleString()} rolled up</span>
                      </div>
                      {campaign.stats.totalLines > 0 && (() => {
                        const reductionPct = Math.round(((campaign.stats.totalLines - campaign.stats.rollupLines) / campaign.stats.totalLines) * 100);
                        return (
                          <div className="text-muted-foreground">
                            {reductionPct}% efficiency
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No campaigns yet. Upload your first CSV file to get started!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">CSV/Parquet Import</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Smart Deduplication</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Multi-tier Rollups</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Export to CSV</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Campaign Management</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
