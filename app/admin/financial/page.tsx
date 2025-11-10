"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer } from 'recharts'
import type { RevenueSummary, InvoiceStats } from "@/lib/types/payment"

export default function AdminFinancialPage() {
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null)
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  useEffect(() => {
    fetchFinancialData()
  }, [selectedPeriod])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [revenueResponse, statsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/admin/financial/revenue?start_date=${startDate}&end_date=${endDate}`),
        fetch('/api/admin/financial/stats'),
        fetch('/api/admin/financial/activities')
      ])

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json()
        setRevenueSummary(revenueData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setInvoiceStats(statsData)
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setRecentActivities(activitiesData.activities || [])
      }
    } catch (error) {
      console.error("Error fetching financial data:", error)
      setError("Không thể tải dữ liệu tài chính")
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7': return '7 ngày qua'
      case '30': return '30 ngày qua'
      case '90': return '3 tháng qua'
      case '365': return '1 năm qua'
      default: return '30 ngày qua'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng Tài chính</h1>
          <p className="text-muted-foreground">Tổng quan về tình hình tài chính của hệ thống</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng Tài chính</h1>
          <p className="text-muted-foreground">Tổng quan về tình hình tài chính của hệ thống</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
              <SelectItem value="90">3 tháng qua</SelectItem>
              <SelectItem value="365">1 năm qua</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchFinancialData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Revenue Overview */}
      {revenueSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueSummary.total_revenue.toLocaleString()} VNĐ</div>
              <p className="text-xs text-muted-foreground">
                {getPeriodLabel(selectedPeriod)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu thuê</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueSummary.rent_revenue.toLocaleString()} VNĐ</div>
              <p className="text-xs text-muted-foreground">
                {revenueSummary.total_revenue > 0 ? 
                  Math.round((revenueSummary.rent_revenue / revenueSummary.total_revenue) * 100) : 0}% tổng doanh thu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu tiện ích</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueSummary.utility_revenue.toLocaleString()} VNĐ</div>
              <p className="text-xs text-muted-foreground">
                {revenueSummary.total_revenue > 0 ? 
                  Math.round((revenueSummary.utility_revenue / revenueSummary.total_revenue) * 100) : 0}% tổng doanh thu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu dịch vụ</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueSummary.service_revenue.toLocaleString()} VNĐ</div>
              <p className="text-xs text-muted-foreground">
                {revenueSummary.total_revenue > 0 ? 
                  Math.round((revenueSummary.service_revenue / revenueSummary.total_revenue) * 100) : 0}% tổng doanh thu
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Statistics */}
      {invoiceStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoiceStats.total_count}</div>
              <p className="text-xs text-muted-foreground">
                {invoiceStats.total_amount.toLocaleString()} VNĐ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{invoiceStats.paid_count}</div>
              <p className="text-xs text-muted-foreground">
                {invoiceStats.paid_amount.toLocaleString()} VNĐ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{invoiceStats.pending_count}</div>
              <p className="text-xs text-muted-foreground">
                {invoiceStats.pending_amount.toLocaleString()} VNĐ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{invoiceStats.overdue_count}</div>
              <p className="text-xs text-muted-foreground">
                {invoiceStats.overdue_amount.toLocaleString()} VNĐ
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phân bố doanh thu theo loại</CardTitle>
            <CardDescription>Biểu đồ tròn thể hiện tỷ trọng doanh thu</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueSummary && (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={[
                      { name: 'Tiền thuê', value: revenueSummary.rent_revenue, color: '#3b82f6' },
                      { name: 'Tiện ích', value: revenueSummary.utility_revenue, color: '#10b981' },
                      { name: 'Dịch vụ', value: revenueSummary.service_revenue, color: '#f59e0b' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Tiền thuê', value: revenueSummary.rent_revenue, color: '#3b82f6' },
                      { name: 'Tiện ích', value: revenueSummary.utility_revenue, color: '#10b981' },
                      { name: 'Dịch vụ', value: revenueSummary.service_revenue, color: '#f59e0b' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} VNĐ`}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dòng tiền thu vào</CardTitle>
            <CardDescription>Biểu đồ cột thể hiện doanh thu theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <RechartsResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { month: 'T7', revenue: 15000000 },
                  { month: 'T8', revenue: 18000000 },
                  { month: 'T9', revenue: 22000000 },
                  { month: 'T10', revenue: 25000000 },
                  { month: 'T11', revenue: 20000000 },
                  { month: 'T12', revenue: 28000000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </RechartsResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các giao dịch và hóa đơn mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const colorClasses = {
                  green: { bg: 'bg-green-50', icon: 'bg-green-100', text: 'text-green-600' },
                  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100', text: 'text-blue-600' },
                  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-600' },
                  red: { bg: 'bg-red-50', icon: 'bg-red-100', text: 'text-red-600' }
                }
                const colors = colorClasses[activity.color as keyof typeof colorClasses] || colorClasses.blue
                
                const IconComponent = activity.icon === 'dollar' ? DollarSign :
                                     activity.icon === 'receipt' ? Receipt :
                                     activity.icon === 'calendar' ? Calendar :
                                     Receipt

                const getTimeAgo = (timestamp: string) => {
                  const diff = Date.now() - new Date(timestamp).getTime()
                  const hours = Math.floor(diff / (1000 * 60 * 60))
                  if (hours < 1) return 'Vừa xong'
                  if (hours < 24) return `${hours} giờ trước`
                  const days = Math.floor(hours / 24)
                  return `${days} ngày trước`
                }

                return (
                  <div key={activity.id} className={`flex items-center gap-3 p-3 ${colors.bg} rounded-lg`}>
                    <div className={`w-8 h-8 ${colors.icon} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có hoạt động nào gần đây</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
