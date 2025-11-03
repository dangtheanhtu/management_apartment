"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface SetupResult {
  email: string
  status: "success" | "error" | "already_exists" | "partial"
  message: string
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SetupResult[]>([])
  const [setupComplete, setSetupComplete] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/setup-test-accounts", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setSetupComplete(true)
      } else {
        setResults([
          {
            email: "Error",
            status: "error",
            message: data.error || "Failed to setup accounts",
          },
        ])
      }
    } catch (error) {
      setResults([
        {
          email: "Error",
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Thiết lập StayEase</CardTitle>
          <CardDescription>Khởi tạo tài khoản test cho phát triển và kiểm thử</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!setupComplete && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Các tài khoản test sẽ được tạo:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>
                    <strong>Admin:</strong> admin@stayease.com
                  </li>
                  <li>
                    <strong>Staff:</strong> staff@stayease.com
                  </li>
                  <li>
                    <strong>Resident:</strong> resident1@example.com
                  </li>
                  <li className="mt-2">
                    <strong>Mật khẩu cho tất cả:</strong> password123
                  </li>
                </ul>
              </div>

              <Button onClick={handleSetup} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thiết lập tài khoản...
                  </>
                ) : (
                  "Tạo tài khoản test"
                )}
              </Button>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Kết quả thiết lập:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    result.status === "success" || result.status === "already_exists"
                      ? "bg-green-50 border-green-200"
                      : result.status === "partial"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-red-50 border-red-200"
                  }`}
                >
                  {result.status === "success" || result.status === "already_exists" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{result.email}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {setupComplete && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium">
                  ✓ Thiết lập hoàn tất! Bạn có thể đăng nhập bằng các tài khoản test.
                </p>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/login">Đi đến đăng nhập</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
