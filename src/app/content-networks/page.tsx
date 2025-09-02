'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, Save, X } from 'lucide-react'

interface ContentNetworkAlias {
  alias: string
  network_names: string[]
}

export default function ContentNetworksPage() {
  const [networkNames, setNetworkNames] = useState<string[]>([])
  const [aliases, setAliases] = useState<ContentNetworkAlias[]>([])
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])
  const [newAlias, setNewAlias] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content-networks')
      const data = await response.json()
      
      if (data.success) {
        setNetworkNames(data.networkNames)
        setAliases(data.aliases)
      } else {
        setError(data.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleNetworkToggle = (networkName: string) => {
    setSelectedNetworks(prev => 
      prev.includes(networkName) 
        ? prev.filter(name => name !== networkName)
        : [...prev, networkName]
    )
  }

  const handleCreateAlias = async () => {
    if (!newAlias.trim() || selectedNetworks.length === 0) {
      setError('Please provide an alias name and select at least one network')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/content-networks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: newAlias.trim(),
          networkNames: selectedNetworks
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewAlias('')
        setSelectedNetworks([])
        await fetchData() // Refresh data
      } else {
        setError(data.error || 'Failed to create alias')
      }
    } catch (err) {
      setError('Failed to create alias')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAlias = async (alias: string) => {
    if (!confirm(`Are you sure you want to delete the alias "${alias}"?`)) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/content-networks?alias=${encodeURIComponent(alias)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchData() // Refresh data
      } else {
        setError(data.error || 'Failed to delete alias')
      }
    } catch (err) {
      setError('Failed to delete alias')
    } finally {
      setSaving(false)
    }
  }

  const getAvailableNetworks = () => {
    const usedNetworks = new Set(aliases.flatMap(alias => alias.network_names))
    return networkNames.filter(name => !usedNetworks.has(name))
  }

  const getUsedNetworks = () => {
    return new Set(aliases.flatMap(alias => alias.network_names))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading content networks...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Network Mapping</h1>
          <p className="text-muted-foreground mt-2">
            Group multiple content network names under a single alias for better rollup reporting
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Create New Alias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Alias
          </CardTitle>
          <CardDescription>
            Select multiple network names and group them under a single alias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter alias name (e.g., 'Streaming Services')"
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleCreateAlias}
              disabled={saving || !newAlias.trim() || selectedNetworks.length === 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Creating...' : 'Create Alias'}
            </Button>
          </div>

          {selectedNetworks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedNetworks.map(network => (
                <Badge key={network} variant="secondary" className="flex items-center gap-1">
                  {network}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleNetworkToggle(network)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
            {getAvailableNetworks().map(network => (
              <div key={network} className="flex items-center space-x-2">
                <Checkbox
                  id={network}
                  checked={selectedNetworks.includes(network)}
                  onCheckedChange={() => handleNetworkToggle(network)}
                />
                <label 
                  htmlFor={network} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {network}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Aliases */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Aliases</CardTitle>
          <CardDescription>
            Manage your content network aliases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aliases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No aliases created yet. Create your first alias above.
            </div>
          ) : (
            <div className="space-y-4">
              {aliases.map((alias, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{alias.alias}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAlias(alias.alias)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alias.network_names.map(network => (
                      <Badge key={network} variant="outline">
                        {network}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{networkNames.length}</div>
              <div className="text-sm text-muted-foreground">Total Network Names</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{aliases.length}</div>
              <div className="text-sm text-muted-foreground">Active Aliases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getAvailableNetworks().length}</div>
              <div className="text-sm text-muted-foreground">Unmapped Networks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
