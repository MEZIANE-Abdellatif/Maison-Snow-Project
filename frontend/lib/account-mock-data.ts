export type OrderStatus = "Processing" | "Shipped" | "Delivered"

export type MockOrderLine = {
  id: string
  name: string
  image: string
  imageAlt: string
  qty: number
  price: number
}

export type MockOrder = {
  id: string
  placedAt: string
  total: number
  status: OrderStatus
  items: MockOrderLine[]
  shippingAddress: string[]
  estimatedDelivery: string
}

export type MockSavedAddress = {
  id: string
  street: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

/** Swap to `[]` to preview the empty orders state. */
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "MS-28491",
    placedAt: "2026-05-02T14:22:00.000Z",
    total: 2055,
    status: "Processing",
    items: [
      {
        id: "l1",
        name: "Ivory Leather Tote",
        image: "/images/product1.jpg",
        imageAlt: "Ivory leather tote bag",
        qty: 1,
        price: 1250,
      },
      {
        id: "l2",
        name: "Gold Link Bracelet",
        image: "/images/product2.jpg",
        imageAlt: "Gold link bracelet",
        qty: 1,
        price: 485,
      },
      {
        id: "l3",
        name: "Champagne Cashmere Scarf",
        image: "/images/product4.jpg",
        imageAlt: "Champagne cashmere scarf",
        qty: 1,
        price: 320,
      },
    ],
    shippingAddress: [
      "Amelia Snow",
      "12 West 56th Street, Apt 9B",
      "New York, NY 10019",
      "United States",
    ],
    estimatedDelivery: "May 14 – May 16, 2026",
  },
  {
    id: "MS-28102",
    placedAt: "2026-04-18T09:05:00.000Z",
    total: 1610,
    status: "Shipped",
    items: [
      {
        id: "l4",
        name: "Noir Mini Crossbody",
        image: "/images/purse.jpg",
        imageAlt: "Noir mini crossbody purse",
        qty: 1,
        price: 890,
      },
      {
        id: "l5",
        name: "Pearl Strand Necklace",
        image: "/images/jewelry.jpg",
        imageAlt: "Pearl strand necklace",
        qty: 1,
        price: 720,
      },
    ],
    shippingAddress: [
      "Amelia Snow",
      "12 West 56th Street, Apt 9B",
      "New York, NY 10019",
      "United States",
    ],
    estimatedDelivery: "May 8, 2026",
  },
  {
    id: "MS-27644",
    placedAt: "2026-03-01T11:40:00.000Z",
    total: 320,
    status: "Delivered",
    items: [
      {
        id: "l6",
        name: "Champagne Cashmere Scarf",
        image: "/images/product4.jpg",
        imageAlt: "Champagne cashmere scarf",
        qty: 1,
        price: 320,
      },
    ],
    shippingAddress: [
      "Amelia Snow",
      "12 West 56th Street, Apt 9B",
      "New York, NY 10019",
      "United States",
    ],
    estimatedDelivery: "Delivered March 6, 2026",
  },
]

export const MOCK_ADDRESSES: MockSavedAddress[] = [
  {
    id: "a1",
    street: "12 West 56th Street, Apt 9B",
    city: "New York",
    postalCode: "10019",
    country: "United States",
    isDefault: true,
  },
  {
    id: "a2",
    street: "48 Rue de Rivoli",
    city: "Paris",
    postalCode: "75004",
    country: "France",
    isDefault: false,
  },
]

export const ADDRESS_COUNTRIES = [
  "United States",
  "France",
  "Morocco",
  "United Kingdom",
  "Italy",
  "Canada",
] as const
