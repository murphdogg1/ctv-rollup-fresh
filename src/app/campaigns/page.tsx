'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Plus, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  campaign_id: string;
  name: string;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Only set campaign name from filename if user has not already entered a custom name
      if (!campaignName) {
        const nameFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setCampaignName(nameFromFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (campaignName) {
      formData.append('campaignName', campaignName);
    }

    try {
      const response = await fetch('/api/campaigns/ingest', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Campaign "${result.campaign.name}" created successfully!`);
        setShowUploadForm(false);
        setSelectedFile(null);
        setCampaignName('');
        fetchCampaigns(); // Refresh the list
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your CTV campaigns and upload new data
          </p>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload New Campaign
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Campaign</CardTitle>
            <CardDescription>
              Upload a CSV file to create a new campaign. You can override the campaign name or let it be derived from the filename.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium mb-2">
                Campaign Name (optional override)
              </label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter custom campaign name or leave blank to use filename"
              />
              <p className="text-sm text-muted-foreground mt-1">
                If left blank, the campaign name will be derived from the filename
              </p>
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                CSV File
              </label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Expected columns: Content Title, Content Network Name, Impression, Quartile100
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Campaign'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
                setCampaignName('');
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first CSV file to create a campaign
              </p>
              <Button onClick={() => setShowUploadForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.campaign_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{campaign.name}</h3>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created {formatDate(campaign.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          Reports available
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/campaigns/${campaign.campaign_id}/reports`}>
                        View Reports
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
