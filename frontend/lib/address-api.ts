export type UserAddress = {
  id: string
  street: string
  building: string
  apartment: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

export type AddressInput = {
  street: string
  building: string
  apartment?: string
  city: string
  postalCode: string
  country: string
  isDefault?: boolean
}

export const ADDRESS_COUNTRIES = ["Poland", "France", "Morocco", "United Kingdom", "United States"] as const

type PrismaAddressRow = {
  id: string
  street: string
  building: string
  apartment: string | null
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

export function mapAddressRow(row: PrismaAddressRow): UserAddress {
  return {
    id: row.id,
    street: row.street,
    building: row.building,
    apartment: row.apartment ?? "",
    city: row.city,
    postalCode: row.postalCode,
    country: row.country,
    isDefault: row.isDefault,
  }
}
