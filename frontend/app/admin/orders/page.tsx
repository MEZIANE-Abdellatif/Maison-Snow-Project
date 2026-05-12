import type { Metadata } from "next"

import { AdminOrdersPageClient } from "@/components/admin/admin-orders-page-client"

export const metadata: Metadata = {
  title: "Orders | Admin | Maison Snow",
  description: "Manage customer orders.",
  alternates: { canonical: "/admin/orders" },
}

export default function AdminOrdersPage() {
  return <AdminOrdersPageClient />
}
