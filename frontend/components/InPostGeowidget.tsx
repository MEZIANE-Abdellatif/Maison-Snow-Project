// TODO: Replace mock UI with real InPost Geowidget
// when NIP is available
// Docs: https://geowidget.inpost.pl

"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const INPOST_MOCK_LOCKERS = [
  {
    id: "waw-centrum",
    name: "InPost Warszawa Centrum",
    address: "ul. Marszałkowska 10",
  },
  {
    id: "waw-wola",
    name: "InPost Warszawa Wola",
    address: "ul. Wolska 25",
  },
  {
    id: "krk-centrum",
    name: "InPost Kraków Centrum",
    address: "ul. Floriańska 5",
  },
  {
    id: "gdn",
    name: "InPost Gdańsk",
    address: "ul. Długa 12",
  },
  {
    id: "poz",
    name: "InPost Poznań",
    address: "ul. Półwiejska 8",
  },
] as const

export type InPostGeowidgetProps = {
  selectedLockerId: string
  onLockerSelect: (lockerId: string) => void
}

export function InPostGeowidget({ selectedLockerId, onLockerSelect }: InPostGeowidgetProps) {
  const selected = INPOST_MOCK_LOCKERS.find((l) => l.id === selectedLockerId)

  return (
    <div className="space-y-4" aria-label="InPost parcel locker selection (mock)">
      <div
        className="flex w-full items-center justify-center rounded-sm border border-border bg-muted/40 text-sm text-muted-foreground"
        style={{ minHeight: 300 }}
        aria-hidden
      >
        Map preview
      </div>
      <p className="text-sm text-foreground">Select your InPost parcel locker</p>
      <div className="space-y-2">
        <label htmlFor="inpost-locker-select" className="text-xs tracking-widest uppercase text-muted-foreground">
          Parcel locker
        </label>
        <Select value={selectedLockerId || undefined} onValueChange={onLockerSelect}>
          <SelectTrigger
            id="inpost-locker-select"
            className="min-h-11 h-auto min-w-0 w-full border-border bg-card py-3 focus-visible:border-gold focus-visible:ring-gold/60"
          >
            <SelectValue placeholder="Choose a locker location" />
          </SelectTrigger>
          <SelectContent>
            {INPOST_MOCK_LOCKERS.map((locker) => (
              <SelectItem key={locker.id} value={locker.id}>
                {locker.name} — {locker.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selected ? (
        <div className="rounded-sm border border-gold/40 bg-cream-dark/30 p-4 text-sm">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Selected locker</p>
          <p className="mt-2 font-medium text-foreground">{selected.name}</p>
          <p className="mt-1 text-muted-foreground">{selected.address}</p>
        </div>
      ) : null}
    </div>
  )
}
