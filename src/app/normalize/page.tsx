'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { BundleMap, GenreMap, ContentAlias } from '@/types/events'

export default function NormalizePage() {
  const [activeTab, setActiveTab] = useState('bundles')
  const [bundles, setBundles] = useState<BundleMap[]>([])
  const [genres, setGenres] = useState<GenreMap[]>([])
  const [contentAliases, setContentAliases] = useState<ContentAlias[]>([])
  const [unmappedContent, setUnmappedContent] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch bundle mappings
      const bundleResponse = await fetch('/api/map/bundles')
      if (bundleResponse.ok) {
        const bundleData = await bundleResponse.json()
        setBundles(bundleData.bundles || [])
      }

      // Fetch genre mappings
      const genreResponse = await fetch('/api/map/genres')
      if (genreResponse.ok) {
        const genreData = await genreResponse.json()
        setGenres(genreData.genres || [])
      }

      // Fetch content aliases
      const aliasResponse = await fetch('/api/map/content-aliases')
      if (aliasResponse.ok) {
        const aliasData = await aliasResponse.json()
        setContentAliases(aliasData.aliases || [])
      }

      // Fetch unmapped content
      const contentResponse = await fetch('/api/rollup/content')
      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        setUnmappedContent(contentData.filter((item: any) => !item.content_key))
      }

      // Fetch stats
      const statusResponse = await fetch('/api/status')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setStats(statusData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleBundleUpdate = async (bundles: BundleMap[]) => {
    try {
      const response = await fetch('/api/map/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundles }),
      })

      if (response.ok) {
        toast.success('Bundle mappings updated successfully')
        await fetchData()
      } else {
        toast.error('Failed to update bundle mappings')
      }
    } catch (error) {
      console.error('Error updating bundles:', error)
      toast.error('Failed to update bundle mappings')
    }
  }

  const handleGenreUpdate = async (genres: GenreMap[]) => {
    try {
      const response = await fetch('/api/map/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres }),
      })

      if (response.ok) {
        toast.success('Genre mappings updated successfully')
        await fetchData()
      } else {
        toast.error('Failed to update genre mappings')
      }
    } catch (error) {
      console.error('Error updating genres:', error)
      toast.error('Failed to update genre mappings')
    }
  }

  const handleContentAliasUpdate = async (aliases: ContentAlias[]) => {
    try {
      const response = await fetch('/api/map/content-aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliases }),
      })

      if (response.ok) {
        toast.success('Content aliases updated successfully')
        await fetchData()
      } else {
        toast.error('Failed to update content aliases')
      }
    } catch (error) {
      console.error('Error updating content aliases:', error)
      toast.error('Failed to update content aliases')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Progress value={33} className="w-64 mb-4" />
          <p>Loading normalization data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Normalization</h1>
        <p className="text-muted-foreground">
          Map and normalize your data for consistent analysis and reporting.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bundle Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bundleCoverage || 0}%
            </div>
            <Progress value={stats.bundleCoverage || 0} className="mt-2" />
            <p className="text-sm text-gray-500 mt-1">
              {stats.mappedBundles || 0} of {stats.totalBundles || 0} bundles mapped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Genre Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.genreCoverage || 0}%
            </div>
            <Progress value={stats.genreCoverage || 0} className="mt-2" />
            <p className="text-sm text-gray-500 mt-1">
              {stats.mappedGenres || 0} of {stats.totalGenres || 0} genres mapped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.contentCoverage || 0}%
            </div>
            <Progress value={stats.contentCoverage || 0} className="mt-2" />
            <p className="text-sm text-gray-500 mt-1">
              {stats.mappedContent || 0} of {stats.totalContent || 0} content mapped
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="bundles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Mappings</CardTitle>
              <CardDescription>
                Map raw bundle identifiers to canonical app bundle, name, and publisher.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BundleMappingTable 
                bundles={bundles} 
                onUpdate={handleBundleUpdate} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genres" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genre Mappings</CardTitle>
              <CardDescription>
                Map raw genre identifiers to canonical genre names.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenreMappingTable 
                genres={genres} 
                onUpdate={handleGenreUpdate} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Aliases</CardTitle>
              <CardDescription>
                Map content titles to canonical content keys for deduplication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentAliasTable 
                aliases={contentAliases}
                unmappedContent={unmappedContent}
                onUpdate={handleContentAliasUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Bundle Mapping Table Component
function BundleMappingTable({ bundles, onUpdate }: { bundles: BundleMap[], onUpdate: (bundles: BundleMap[]) => void }) {
  const [editingBundles, setEditingBundles] = useState<BundleMap[]>(bundles)

  const handleSave = () => {
    onUpdate(editingBundles)
  }

  const addBundle = () => {
    setEditingBundles([...editingBundles, {
      raw: '',
      app_bundle: '',
      app_name: '',
      publisher: '',
      mask_reason: null
    }])
  }

  const removeBundle = (index: number) => {
    setEditingBundles(editingBundles.filter((_, i) => i !== index))
  }

  const updateBundle = (index: number, field: keyof BundleMap, value: string) => {
    const newBundles = [...editingBundles]
    newBundles[index] = { ...newBundles[index], [field]: value }
    setEditingBundles(newBundles)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bundle Mappings</h3>
        <div className="space-x-2">
          <Button onClick={addBundle} variant="outline">Add Bundle</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Raw</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">App Bundle</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">App Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Publisher</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Mask Reason</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {editingBundles.map((bundle, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <Input
                    value={bundle.raw}
                    onChange={(e) => updateBundle(index, 'raw', e.target.value)}
                    placeholder="Raw bundle ID"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={bundle.app_bundle}
                    onChange={(e) => updateBundle(index, 'app_bundle', e.target.value)}
                    placeholder="com.example.app"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={bundle.app_name}
                    onChange={(e) => updateBundle(index, 'app_name', e.target.value)}
                    placeholder="App Name"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={bundle.publisher}
                    onChange={(e) => updateBundle(index, 'publisher', e.target.value)}
                    placeholder="Publisher"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={bundle.mask_reason || ''}
                    onChange={(e) => updateBundle(index, 'mask_reason', e.target.value)}
                    placeholder="Mask reason (optional)"
                  />
                </td>
                <td className="px-4 py-2">
                  <Button onClick={() => removeBundle(index)} variant="destructive" size="sm">
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Genre Mapping Table Component
function GenreMappingTable({ genres, onUpdate }: { genres: GenreMap[], onUpdate: (genres: GenreMap[]) => void }) {
  const [editingGenres, setEditingGenres] = useState<GenreMap[]>(genres)

  const handleSave = () => {
    onUpdate(editingGenres)
  }

  const addGenre = () => {
    setEditingGenres([...editingGenres, { raw: '', genre_canon: '' }])
  }

  const removeGenre = (index: number) => {
    setEditingGenres(editingGenres.filter((_, i) => i !== index))
  }

  const updateGenre = (index: number, field: keyof GenreMap, value: string) => {
    const newGenres = [...editingGenres]
    newGenres[index] = { ...newGenres[index], [field]: value }
    setEditingGenres(newGenres)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Genre Mappings</h3>
        <div className="space-x-2">
          <Button onClick={addGenre} variant="outline">Add Genre</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Raw</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Canonical Genre</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {editingGenres.map((genre, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <Input
                    value={genre.raw}
                    onChange={(e) => updateGenre(index, 'raw', e.target.value)}
                    placeholder="Raw genre"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={genre.genre_canon}
                    onChange={(e) => updateGenre(index, 'genre_canon', e.target.value)}
                    placeholder="Canonical genre"
                  />
                </td>
                <td className="px-4 py-2">
                  <Button onClick={() => removeGenre(index)} variant="destructive" size="sm">
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Content Alias Table Component
function ContentAliasTable({ aliases, unmappedContent, onUpdate }: { 
  aliases: ContentAlias[], 
  unmappedContent: any[], 
  onUpdate: (aliases: ContentAlias[]) => void 
}) {
  const [editingAliases, setEditingAliases] = useState<ContentAlias[]>(aliases)

  const handleSave = () => {
    onUpdate(editingAliases)
  }

  const addAlias = () => {
    setEditingAliases([...editingAliases, { content_title_canon: '', content_key: '' }])
  }

  const removeAlias = (index: number) => {
    setEditingAliases(editingAliases.filter((_, i) => i !== index))
  }

  const updateAlias = (index: number, field: keyof ContentAlias, value: string) => {
    const newAliases = [...editingAliases]
    newAliases[index] = { ...newAliases[index], [field]: value }
    setEditingAliases(newAliases)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Content Aliases</h3>
        <div className="space-x-2">
          <Button onClick={addAlias} variant="outline">Add Alias</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Content Title (Canonical)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Content Key</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {editingAliases.map((alias, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <Input
                    value={alias.content_title_canon}
                    onChange={(e) => updateAlias(index, 'content_title_canon', e.target.value)}
                    placeholder="Content title (canonical)"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={alias.content_key}
                    onChange={(e) => updateAlias(index, 'content_key', e.target.value)}
                    placeholder="Content key"
                  />
                </td>
                <td className="px-4 py-2">
                  <Button onClick={() => removeAlias(index)} variant="destructive" size="sm">
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unmappedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unmapped Content</CardTitle>
            <CardDescription>
              Content titles that need mapping to canonical keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unmappedContent.slice(0, 10).map((content, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{content.content_title_canon}</span>
                  <Badge variant="secondary">Unmapped</Badge>
                </div>
              ))}
              {unmappedContent.length > 10 && (
                <p className="text-sm text-gray-500">
                  ... and {unmappedContent.length - 10} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
