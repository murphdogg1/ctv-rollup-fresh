'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AppRollupItem {
  campaign_id: string;
  app_name: string;
  impressions: number;
  completes: number;
  avg_vcr: number;
  content_count: number;
}

export default function InventoryPage() {
  const [data, setData] = useState<AppRollupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/inventory');
        const json = await res.json();
        if (json.success) {
          const items = (json.items || []).map((i: any) => ({
            campaign_id: 'all',
            app_name: i.app_name,
            impressions: i.impressions,
            completes: i.completes,
            avg_vcr: i.impressions > 0 ? Math.round((i.completes / i.impressions) * 100 * 100) / 100 : 0,
            content_count: i.content_count
          }))
          setData(items);
        } else {
          setError('Failed to load inventory composition');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load inventory composition');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Simple treemap-like layout: blocks sized proportionally to impressions
  const total = data.reduce((s, r) => s + (r.impressions || 0), 0);
  const items = data.filter(d => d.impressions > 0).slice(0, 50); // limit for layout

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Composition</CardTitle>
          <CardDescription>Content networks sized by impressions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No data</div>
          ) : (
            <div className="w-full h-[600px] grid grid-cols-6 gap-2">
              {items.map((item, i) => {
                const pct = total > 0 ? item.impressions / total : 0;
                const area = Math.max(pct, 0.01); // minimum visual size
                const height = Math.max(Math.round(area * 600), 24);
                return (
                  <div key={i} className="border rounded p-2 flex flex-col justify-between bg-white" style={{ height }}>
                    <div className="text-sm font-semibold truncate" title={item.app_name}>{item.app_name}</div>
                    <div className="text-xs text-muted-foreground">{item.impressions.toLocaleString()} imp</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


