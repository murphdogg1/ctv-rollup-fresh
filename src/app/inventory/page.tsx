'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Aggregate small slices into "Other" and build data for Recharts
  const total = data.reduce((s, r) => s + (r.impressions || 0), 0);
  const sorted = [...data].sort((a, b) => b.impressions - a.impressions);
  const shown = sorted.filter(d => d.impressions > 0);
  const cutoff = Math.max(0.01 * total, 1000); // 1% or 1000 imps min
  const major = shown.filter(d => d.impressions >= cutoff);
  const minor = shown.filter(d => d.impressions < cutoff);
  const otherTotal = minor.reduce((s, r) => s + r.impressions, 0);
  const chartData = [
    ...major.map(m => ({ name: m.app_name, size: m.impressions })),
    ...(otherTotal > 0 ? [{ name: 'Other', size: otherTotal }] : [])
  ];

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
            <div className="w-full h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={chartData}
                  dataKey="size"
                  nameKey="name"
                  stroke="#fff"
                  fill="#60a5fa"
                  aspectRatio={4 / 3}
                  content={<CustomTreemapContent />}
                >
                  <Tooltip content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const p: any = payload[0].payload;
                    return (
                      <div className="rounded bg-white/90 shadow p-2 text-xs">
                        <div className="font-medium">{p.name}</div>
                        <div>{p.size.toLocaleString()} impressions</div>
                      </div>
                    );
                  }} />
                </Treemap>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomTreemapContent(props: any) {
  const { x, y, width, height, name } = props;
  const labelVisible = width > 80 && height > 40;
  const bg = name === 'Other' ? '#cbd5e1' : '#93c5fd';
  const fg = '#0f172a';
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: bg, stroke: '#fff' }} />
      {labelVisible && (
        <text x={x + 8} y={y + 20} fill={fg} fontSize={12} fontWeight={600}>
          {name}
        </text>
      )}
    </g>
  );
}


