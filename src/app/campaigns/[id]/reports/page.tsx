'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, BarChart3, TrendingUp, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  campaign_id: string;
  name: string;
}

interface AppRollup {
  app_name: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
  content_count: number;
}

interface GenreRollup {
  genre_canon: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
  content_count: number;
}

interface ContentRollup {
  content_title: string;
  content_network_name: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
}

export default function CampaignReportsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [appRollup, setAppRollup] = useState<AppRollup[]>([]);
  const [genreRollup, setGenreRollup] = useState<GenreRollup[]>([]);
  const [contentRollup, setContentRollup] = useState<ContentRollup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('app');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching data for campaign:', campaignId);
      
      // Fetch rollup data directly
      const [appResponse, genreResponse, contentResponse] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}/rollup/app`),
        fetch(`/api/campaigns/${campaignId}/rollup/genre`),
        fetch(`/api/campaigns/${campaignId}/rollup/content`)
      ]);

      const appData = await appResponse.json();
      const genreData = await genreResponse.json();
      const contentData = await contentResponse.json();

      console.log('App rollup data:', appData);
      console.log('Genre rollup data:', genreData);
      console.log('Content rollup data:', contentData);

      if (appData.success) {
        setAppRollup(appData.rollup);
        setCampaign(appData.campaign);
      }
      if (genreData.success) setGenreRollup(genreData.rollup);
      if (contentData.success) setContentRollup(contentData.rollup);

    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      toast.error('Failed to fetch campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      console.log('Exporting:', type);
      const response = await fetch(`/api/campaigns/${campaignId}/export?type=${type}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.name || 'campaign'}-${type}-rollup.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} export successful!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${type} data`);
    }
  };

  const totalImpressions = appRollup.reduce((sum, r) => sum + r.impressions, 0);
  const totalCompletes = appRollup.reduce((sum, r) => sum + r.completes, 0);
  const overallVCR = totalImpressions > 0 ? Math.round((totalCompletes / totalImpressions) * 100 * 100) / 100 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Loading campaign reports...</p>
        <Button onClick={fetchCampaignData} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg text-red-600">Campaign not found</p>
        <Button onClick={fetchCampaignData} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name} Reports</h1>
          <p className="text-muted-foreground">Detailed performance metrics for your campaign</p>
        </div>
        <Button onClick={() => handleExport(activeTab)}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completes</CardTitle>
            <TrendingUp className="h-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall VCR</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallVCR}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="app">App Rollup</TabsTrigger>
          <TabsTrigger value="genre">Genre Rollup</TabsTrigger>
          <TabsTrigger value="content">Content Rollup</TabsTrigger>
        </TabsList>

        {/* App Rollup Tab */}
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>App Rollup</CardTitle>
              <CardDescription>Performance by Content Network Name (App)</CardDescription>
            </CardHeader>
            <CardContent>
              {appRollup.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Name</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Completes</TableHead>
                        <TableHead>Avg VCR (%)</TableHead>
                        <TableHead>Content Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appRollup.map((rollup, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{rollup.app_name}</TableCell>
                          <TableCell>{rollup.impressions.toLocaleString()}</TableCell>
                          <TableCell>{rollup.completes.toLocaleString()}</TableCell>
                          <TableCell>{rollup.avg_vcr}%</TableCell>
                          <TableCell>{rollup.content_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No app rollup data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genre Rollup Tab */}
        <TabsContent value="genre">
          <Card>
            <CardHeader>
              <CardTitle>Genre Rollup</CardTitle>
              <CardDescription>Performance by Genre</CardDescription>
            </CardHeader>
            <CardContent>
              {genreRollup.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Genre</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Completes</TableHead>
                        <TableHead>Avg VCR (%)</TableHead>
                        <TableHead>Content Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {genreRollup.map((rollup, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{rollup.avg_vcr}%</TableCell>
                          <TableCell>{rollup.impressions.toLocaleString()}</TableCell>
                          <TableCell>{rollup.completes.toLocaleString()}</TableCell>
                          <TableCell>{rollup.avg_vcr}%</TableCell>
                          <TableCell>{rollup.content_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No genre rollup data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Rollup Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Rollup</CardTitle>
              <CardDescription>Performance by Content Title</CardDescription>
            </CardHeader>
            <CardContent>
              {contentRollup.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content Title</TableHead>
                        <TableHead>App Name</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Completes</TableHead>
                        <TableHead>Avg VCR (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentRollup.map((rollup, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{rollup.content_title}</TableCell>
                          <TableCell>{rollup.content_network_name}</TableCell>
                          <TableCell>{rollup.impressions.toLocaleString()}</TableCell>
                          <TableCell>{rollup.completes.toLocaleString()}</TableCell>
                          <TableCell>{rollup.avg_vcr}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No content rollup data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
