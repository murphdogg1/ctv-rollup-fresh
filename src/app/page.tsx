import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, TrendingUp, Eye, Calendar, Upload, BarChart, Tag, Film } from 'lucide-react';
import DashboardClient from './dashboard-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CTV Rollup Dashboard</h1>
        <p className="text-muted-foreground">
          Ingest, normalize, and analyze CTV delivery logs with deduplication and rollup reporting.
        </p>
        <div className="mt-2 text-xs text-green-600">
          ✅ Server-side rendering active - Fresh deployment!
        </div>
        <div className="mt-1 text-xs text-purple-600">
          🚀 FRESH REPOSITORY - Connected to murphdogg1/ctv-rollup-fresh
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Video completions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall VCR</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Video completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Campaigns</CardTitle>
            <CardDescription>Upload new CSV files and manage existing campaigns</CardDescription>
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
            <CardTitle>Normalize Data</CardTitle>
            <CardDescription>Map bundles, genres, and content for consistent analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/normalize">
              <Button className="w-full">
                <Tag className="w-4 h-4 mr-2" />
                Manage Mappings
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>View Reports</CardTitle>
            <CardDescription>Analyze performance by app, genre, and content</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/campaigns">
              <Button className="w-full">
                <BarChart className="w-4 h-4 mr-2" />
                View Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest campaigns added to the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-4 text-muted-foreground">Loading campaigns...</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge>CSV/Parquet Import</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge>Smart Deduplication</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge>Multi-tier Rollups</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge>Export to CSV</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge>Campaign Management</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
