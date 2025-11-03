"use client"

import { useState, useEffect } from "react"
import { getResidents, type Resident } from "@/lib/residents/actions"
import { ResidentTable } from "@/components/residents/resident-table"
import { CreateResidentDialog } from "@/components/residents/create-resident-dialog"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResidents = async () => {
    try {
      console.log("Fetching residents...")
      setLoading(true)
      const data = await getResidents()
      console.log("Fetched residents:", data)
      setResidents(data)
    } catch (error) {
      console.error("Failed to fetch residents:", error)
      toast.error("Không thể tải danh sách cư dân")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResidents()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý cư dân</h1>
          <p className="text-muted-foreground">Quản lý phân công cư dân và thông tin thuê</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchResidents}
            disabled={loading}
            title="Làm mới danh sách"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <CreateResidentDialog onSuccess={fetchResidents}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Phân công cư dân
            </Button>
          </CreateResidentDialog>
        </div>
      </div>

      <ResidentTable residents={residents} onUpdate={fetchResidents} loading={loading} />
    </div>
  )
}
