import { customType } from 'drizzle-orm/pg-core'

export type Point = { x: number; y: number }

/**
 * Point PostGIS contraint en SRID 4326.
 *
 * drizzle-orm 0.45.2 ignore l'option `srid` de `geometry()` : `getSQLType()`
 * renvoie toujours `geometry(point)` et `mapToDriverValue()` sérialise en
 * `point(x y)`, soit du WKT sans SRID. Les positions seraient donc stockées en
 * SRID 0 et toute comparaison avec un point 4326 lèverait
 * "Operation on mixed SRID geometries".
 *
 * Ce type fige le SRID dans le DDL, ce qui garde `drizzle-kit generate` et
 * `drizzle-kit push` cohérents entre eux, et sérialise en EWKT.
 */
export const point4326 = customType<{
  data: Point
  driverData: string
}>({
  dataType() {
    return 'geometry(Point,4326)'
  },
  toDriver(value: Point): string {
    return `SRID=4326;POINT(${value.x} ${value.y})`
  },
  fromDriver(value: string): Point {
    return parseEwkbPoint(value)
  },
})

/** Décode un point 2D depuis l'EWKB hexadécimal renvoyé par PostGIS. */
function parseEwkbPoint(hex: string): Point {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  const view = new DataView(bytes.buffer)
  const littleEndian = bytes[0] === 1
  let offset = 1

  const geomType = view.getUint32(offset, littleEndian)
  offset += 4
  if (geomType & 0x20000000) offset += 4 // drapeau SRID présent
  if ((geomType & 0xffff) !== 1) {
    throw new Error(`Géométrie non supportée : type ${geomType & 0xffff}, un point est attendu`)
  }

  return { x: view.getFloat64(offset, littleEndian), y: view.getFloat64(offset + 8, littleEndian) }
}
