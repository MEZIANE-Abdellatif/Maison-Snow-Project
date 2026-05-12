import type { ProductCategory } from "@/lib/shop-data"

export type PaymentStatus = "Paid" | "Pending" | "Failed"
export type DeliveryStatus = "Processing" | "Shipped" | "Delivered"

export type AdminOrderLine = {
  id: string
  name: string
  image: string
  imageAlt: string
  size?: string
  qty: number
  price: number
}

export type AdminOrder = {
  id: string
  customerEmail: string
  customerName: string
  phone: string
  shippingAddressLines: string[]
  date: string
  itemsCount: number
  total: number
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  lines: AdminOrderLine[]
}

export type AdminProduct = {
  id: string
  name: string
  category: ProductCategory
  description: string
  price: number
  stock: number
  active: boolean
  image: string
  sizes: string[]
}

export const ADMIN_PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "purse", label: "Purse" },
  { value: "jewelry", label: "Jewelry" },
  { value: "scarf", label: "Scarf" },
  { value: "dress", label: "Dress" },
]

export const ADMIN_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "One Size"] as const

export const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "MS-28491",
    customerEmail: "amelia.snow@example.com",
    customerName: "Amelia Snow",
    phone: "+1 (212) 555-0199",
    shippingAddressLines: [
      "12 West 56th Street, Apt 9B",
      "New York, NY 10019",
      "United States",
    ],
    date: "2026-05-02T14:22:00.000Z",
    itemsCount: 3,
    total: 2055,
    paymentStatus: "Paid",
    deliveryStatus: "Processing",
    lines: [
      {
        id: "l1",
        name: "Ivory Leather Tote",
        image: "/images/product1.jpg",
        imageAlt: "Ivory leather tote",
        size: "M",
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
        imageAlt: "Cashmere scarf",
        qty: 1,
        price: 320,
      },
    ],
  },
  {
    id: "MS-28102",
    customerEmail: "orders@atelier.demo",
    customerName: "Jean Dupont",
    phone: "+33 6 12 34 56 78",
    shippingAddressLines: ["48 Rue de Rivoli", "75004 Paris", "France"],
    date: "2026-04-18T09:05:00.000Z",
    itemsCount: 2,
    total: 1610,
    paymentStatus: "Pending",
    deliveryStatus: "Shipped",
    lines: [
      {
        id: "l4",
        name: "Noir Mini Crossbody",
        image: "/images/purse.jpg",
        imageAlt: "Noir crossbody",
        size: "One Size",
        qty: 1,
        price: 890,
      },
      {
        id: "l5",
        name: "Pearl Strand Necklace",
        image: "/images/jewelry.jpg",
        imageAlt: "Pearl necklace",
        qty: 1,
        price: 720,
      },
    ],
  },
  {
    id: "MS-27644",
    customerEmail: "hello@maisonsnow.com",
    customerName: "Maison Snow Staff",
    phone: "+1 (212) 555-1234",
    shippingAddressLines: ["123 Fashion Avenue", "New York, NY 10001", "United States"],
    date: "2026-03-01T11:40:00.000Z",
    itemsCount: 1,
    total: 320,
    paymentStatus: "Failed",
    deliveryStatus: "Delivered",
    lines: [
      {
        id: "l6",
        name: "Champagne Cashmere Scarf",
        image: "/images/product4.jpg",
        imageAlt: "Scarf",
        qty: 1,
        price: 320,
      },
    ],
  },
  {
    id: "MS-29001",
    customerEmail: "vip.client@example.com",
    customerName: "Sofia Laurent",
    phone: "+1 (646) 555-0100",
    shippingAddressLines: ["200 Park Avenue", "New York, NY 10166", "United States"],
    date: "2026-05-09T16:00:00.000Z",
    itemsCount: 1,
    total: 485,
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    lines: [
      {
        id: "l7",
        name: "Gold Link Bracelet",
        image: "/images/product2.jpg",
        imageAlt: "Bracelet",
        size: "S",
        qty: 1,
        price: 485,
      },
    ],
  },
]

export const MOCK_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: "p1",
    name: "Ivory Leather Tote",
    category: "purse",
    description: "Hand-finished Italian leather with suede-lined interior.",
    price: 1250,
    stock: 12,
    active: true,
    image: "/images/product1.jpg",
    sizes: ["S", "M", "L"],
  },
  {
    id: "p2",
    name: "Gold Link Bracelet",
    category: "jewelry",
    description: "Warm-toned links with a secure clasp.",
    price: 485,
    stock: 28,
    active: true,
    image: "/images/product2.jpg",
    sizes: ["One Size"],
  },
  {
    id: "p3",
    name: "Champagne Cashmere Scarf",
    category: "scarf",
    description: "Lightweight cashmere with hand-rolled edges.",
    price: 320,
    stock: 6,
    active: false,
    image: "/images/product4.jpg",
    sizes: ["One Size"],
  },
]
