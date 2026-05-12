"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  ADMIN_PRODUCT_CATEGORIES,
  ADMIN_SIZE_OPTIONS,
  MOCK_ADMIN_PRODUCTS,
  type AdminProduct,
} from "@/lib/admin-mock-data"
import type { ProductCategory } from "@/lib/shop-data"
import { formatPrice } from "@/lib/shop-data"
import { authInputClass, authLabelClass, authPrimaryButtonClass } from "@/components/auth/auth-field-styles"
import { cn } from "@/lib/utils"

const modalFieldClass = cn(
  authInputClass,
  "rounded-sm border-border focus-visible:border-gold focus-visible:ring-gold/35",
)

function categoryLabel(c: ProductCategory) {
  return ADMIN_PRODUCT_CATEGORIES.find((x) => x.value === c)?.label ?? c
}

export function AdminProductsPageClient() {
  const [products, setProducts] = useState<AdminProduct[]>(() => [...MOCK_ADMIN_PRODUCTS])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<ProductCategory>("purse")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [sizes, setSizes] = useState<Set<string>>(() => new Set())
  const [active, setActive] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState("/images/product1.jpg")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setEditingId(null)
    setName("")
    setCategory("purse")
    setDescription("")
    setPrice("")
    setStock("")
    setSizes(new Set())
    setActive(true)
    setImagePreview(null)
    setImagePath("/images/product1.jpg")
  }, [])

  const openAdd = useCallback(() => {
    resetForm()
    setModalOpen(true)
  }, [resetForm])

  const openEdit = useCallback((p: AdminProduct) => {
    setEditingId(p.id)
    setName(p.name)
    setCategory(p.category)
    setDescription(p.description)
    setPrice(String(p.price))
    setStock(String(p.stock))
    setSizes(new Set(p.sizes))
    setActive(p.active)
    setImagePreview(null)
    setImagePath(p.image)
    setModalOpen(true)
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const onFile = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return
    setImagePreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setImagePath("")
  }, [])

  const saveProduct = useCallback(() => {
    const priceNum = Number.parseFloat(price) || 0
    const stockNum = Number.parseInt(stock, 10) || 0
    const sizeList = ADMIN_SIZE_OPTIONS.filter((s) => sizes.has(s))

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: name.trim() || p.name,
                category,
                description: description.trim(),
                price: priceNum,
                stock: stockNum,
                active,
                image: imagePreview && imagePreview.startsWith("blob:") ? p.image : imagePath || p.image,
                sizes: sizeList.length ? sizeList : ["One Size"],
              }
            : p,
        ),
      )
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          name: name.trim() || "Untitled",
          category,
          description: description.trim(),
          price: priceNum,
          stock: stockNum,
          active,
          image: "/images/product1.jpg",
          sizes: sizeList.length ? sizeList : ["One Size"],
        },
      ])
    }
    setModalOpen(false)
    resetForm()
  }, [
    editingId,
    name,
    category,
    description,
    price,
    stock,
    sizes,
    active,
    imagePath,
    imagePreview,
    resetForm,
  ])

  const confirmDelete = useCallback(() => {
    if (!deleteId) return
    setProducts((prev) => prev.filter((p) => p.id !== deleteId))
    setDeleteId(null)
  }, [deleteId])

  const toggleSize = useCallback((s: string) => {
    setSizes((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }, [])

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">Products</h1>
        <Button
          type="button"
          onClick={openAdd}
          className={cn(authPrimaryButtonClass, "w-full shrink-0 sm:w-auto sm:min-w-[10rem]")}
        >
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 py-20">
          <p className="font-serif text-xl text-muted-foreground">No products yet</p>
          <Button type="button" onClick={openAdd} className={cn(authPrimaryButtonClass, "w-auto min-w-[10rem]")}>
            Add Product
          </Button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground" />
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-sm border border-border">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[10rem] truncate text-sm font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{categoryLabel(p.category)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-sm tabular-nums">{p.stock}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.active}
                      onCheckedChange={(v) =>
                        setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: v } : x)))
                      }
                      aria-label={`Toggle ${p.name} on store`}
                    />
                  </TableCell>
                  <TableCell className="space-x-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="rounded-sm text-sm font-medium text-gold underline-offset-4 transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(p.id)}
                      className="rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent
          showCloseButton
          panelMotion="fade"
          className="max-h-[90vh] overflow-y-auto rounded-sm border border-gold/45 bg-card p-6 sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-wide text-foreground">
              {editingId ? "Edit product" : "Add product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-p-name" className={authLabelClass}>
                Product name
              </Label>
              <Input id="admin-p-name" value={name} onChange={(e) => setName(e.target.value)} className={modalFieldClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-p-cat" className={authLabelClass}>
                Category
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
                <SelectTrigger id="admin-p-cat" className={cn(modalFieldClass, "h-11")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border">
                  {ADMIN_PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-p-desc" className={authLabelClass}>
                Description
              </Label>
              <Textarea
                id="admin-p-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={cn(modalFieldClass, "min-h-[6rem] resize-y")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-p-price" className={authLabelClass}>
                  Price
                </Label>
                <Input
                  id="admin-p-price"
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={modalFieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-p-stock" className={authLabelClass}>
                  Stock quantity
                </Label>
                <Input
                  id="admin-p-stock"
                  type="number"
                  min={0}
                  step={1}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={modalFieldClass}
                />
              </div>
            </div>
            <fieldset className="space-y-3">
              <legend className={cn(authLabelClass, "mb-1 block")}>Sizes</legend>
              <div className="flex flex-wrap gap-x-4 gap-y-3">
                {ADMIN_SIZE_OPTIONS.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={sizes.has(s)} onCheckedChange={() => toggleSize(s)} aria-label={s} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <span className={authLabelClass}>Image</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  onFile(e.dataTransfer.files?.[0] ?? null)
                }}
                className="flex min-h-[8rem] w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:border-gold/45 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
              >
                {imagePreview ?? imagePath ? (
                  <div className="relative mt-2 h-28 w-full max-w-[12rem]">
                    <Image
                      src={imagePreview ?? imagePath}
                      alt={name.trim() ? `Preview: ${name}` : "Selected product image preview"}
                      fill
                      className="object-contain"
                      unoptimized={Boolean(imagePreview?.startsWith("blob:"))}
                    />
                  </div>
                ) : null}
                <span className="mt-2">Drag and drop an image here, or click to upload</span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
              <span className="text-sm font-medium text-foreground">Active on store</span>
              <Switch checked={active} onCheckedChange={setActive} aria-label="Product visible on store" />
            </div>
          </div>
          <DialogFooter className="mt-4 flex-col gap-3 sm:flex-col">
            <Button type="button" className={cn(authPrimaryButtonClass, "w-full")} onClick={saveProduct}>
              Save Product
            </Button>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
              className="text-center text-sm font-medium text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-light"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-sm border border-gold/45 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from the list. You can add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
