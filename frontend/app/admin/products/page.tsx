import type { Metadata } from "next"

import { AdminProductsPageClient } from "@/components/admin/admin-products-page-client"

export const metadata: Metadata = {
  title: "Products | Admin | Maison Snow",
  description: "Manage catalog products.",
  alternates: { canonical: "/admin/products" },
}

export default function AdminProductsPage() {
  return <AdminProductsPageClient />
}
