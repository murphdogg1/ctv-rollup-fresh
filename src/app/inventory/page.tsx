'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const { chartData, chartTotal } = useMemo(() => {
    const totalImps = data.reduce((s, r) => s + (r.impressions || 0), 0)
    const sorted = [...data]
      .filter(d => d.impressions > 0)
      .sort((a, b) => b.impressions - a.impressions)
    const cutoff = Math.max(0.005 * totalImps, 500) // 0.5% or 500 imps min
    const top = sorted.slice(0, 30) // cap categories for readability
    const majors = top.filter(d => d.impressions >= cutoff)
    const minors = [...sorted.slice(30), ...top.filter(d => d.impressions < cutoff)]
    const otherTotal = minors.reduce((s, r) => s + r.impressions, 0)
    const cleaned = majors.map(m => ({
      name: m.app_name && m.app_name !== 'null' ? m.app_name : 'Unknown',
      size: m.impressions
    }))
    if (otherTotal > 0) cleaned.push({ name: 'Other', size: otherTotal })
    return { chartData: cleaned, chartTotal: totalImps }
  }, [data])

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
          ) : chartData.length === 0 ? (
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
                  isAnimationActive
                  content={<CustomTreemapContent total={chartTotal} />}
                >
                  <Tooltip content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const p: any = payload[0].payload;
                    return (
                      <div className="rounded bg-white/90 shadow p-2 text-xs">
                        <div className="font-medium">{p.name}</div>
                        <div>{p.size.toLocaleString()} impressions</div>
                        {chartTotal > 0 && (
                          <div>{Math.round((p.size / chartTotal) * 100)}% share</div>
                        )}
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
  const { x, y, width, height, name, index, depth, total } = props as any;
  if (depth !== 1) return null; // only render leaf nodes
  const labelVisible = width > 60 && height > 28;
  const palette = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#f87171', '#38bdf8', '#22c55e', '#fb923c'];
  const bg = name === 'Other' ? '#94a3b8' : palette[index % palette.length];
  const fg = '#0f172a';
  const share = total > 0 ? Math.round((props.size / total) * 100) : 0;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: bg, stroke: '#e5e7eb', strokeOpacity: 0.6 }} />
      {labelVisible && (
        <>
          {/* translucent label band for readability */}
          <rect x={x} y={y} width={width} height={28} style={{ fill: 'rgba(0,0,0,0.35)' }} />
          <text x={x + 8} y={y + 18} fill="#ffffff" fontSize={12} fontWeight={700}>
            {name}
          </text>
          {height > 44 && (
            <text x={x + 8} y={y + 34} fill="#f1f5f9" fontSize={11}>
              {share}%
            </text>
          )}
        </>
      )}
    </g>
  );
}


