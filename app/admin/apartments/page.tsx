import { getAllApartments } from "@/lib/apartments/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApartmentTable } from "@/components/apartments/apartment-table"
import { CreateApartmentDialog } from "@/components/apartments/create-apartment-dialog"

export default async function ApartmentsPage() {
  const apartments = await getAllApartments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý căn hộ</h1>
          <p className="text-muted-foreground">Quản lý các đơn vị căn hộ và tình trạng sẵn có</p>
        </div>
        <CreateApartmentDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả căn hộ</CardTitle>
          <CardDescription>
            {apartments.length} căn hộ trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApartmentTable apartments={apartments} />
        </CardContent>
      </Card>
    </div>
  )
}
