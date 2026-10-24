export type RoomKind = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'circulation';

export interface Point { x: number; y: number }
export interface Rect { x: number; y: number; width: number; height: number }
export interface Room extends Rect { id: string; name: string; kind: RoomKind }
export interface PlanModel {
  schemaVersion: 1;
  id: string;
  title: string;
  units: 'ft';
  plot: { width: number; depth: number };
  building: Rect;
  rooms: Room[];
  metadata: { bedrooms: number; alternative: 'compact' | 'balanced' | 'open'; generatedBy: 'juno-deterministic-v1' };
}
export interface PlanInput { plotWidthFt: number; plotDepthFt: number; bedrooms: number; alternative?: PlanModel['metadata']['alternative'] }

const MIN_ROOM_SIDE = 5;
const EPSILON = 0.001;

/** Generates an original, deterministic concept layout. Not a construction drawing. */
export function generatePlan(input: PlanInput): PlanModel {
  const { plotWidthFt: width, plotDepthFt: depth, bedrooms, alternative = 'balanced' } = input;
  if (![width, depth, bedrooms].every(Number.isFinite) || width <= 0 || depth <= 0) throw new Error('Plot dimensions must be positive finite numbers.');
  if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 8) throw new Error('Bedrooms must be a whole number from 1 to 8.');
  if (width < 16 || depth < 18) throw new Error('Plot is too small for this starter concept; use at least 16 ft × 18 ft.');
  const inset = Math.min(3, width * 0.08, depth * 0.08);
  const building = { x: inset, y: inset, width: width - inset * 2, height: depth - inset * 2 };
  const usableW = building.width;
  const usableD = building.height;
  const corridor = alternative === 'compact' ? 0 : alternative === 'open' ? 0.06 : 0.04;
  const hallW = usableW * (0.34 + corridor);
  const privateW = usableW - hallW;
  const rooms: Room[] = [];
  const add = (id: string, name: string, kind: RoomKind, x: number, y: number, w: number, h: number) => {
    rooms.push({ id, name, kind, x, y, width: w, height: h });
  };
  const splitD = usableD * 0.48;
  add('living', 'Living / dining', 'living', inset, inset, hallW, splitD);
  add('kitchen', 'Kitchen', 'kitchen', inset, inset + splitD, hallW, usableD - splitD);
  const bedroomRows = Math.ceil(bedrooms / 2);
  const rowH = usableD / (bedroomRows + 1);
  for (let i = 0; i < bedrooms; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = inset + hallW + (col ? privateW / 2 : 0);
    const w = col ? privateW / 2 : privateW / 2;
    const y = inset + row * rowH;
    const h = rowH;
    add(`bedroom-${i + 1}`, `Bedroom ${i + 1}`, 'bedroom', x, y, w, h);
  }
  const remainingY = inset + bedroomRows * rowH;
  const remainingH = Math.max(MIN_ROOM_SIDE, inset + usableD - remainingY);
  add('bathroom', 'Bath / utility', 'bathroom', inset + hallW, remainingY, privateW, Math.min(remainingH, usableD - bedroomRows * rowH));
  const plan: PlanModel = {
    schemaVersion: 1,
    id: `juno-${Math.round(width)}x${Math.round(depth)}-${bedrooms}-${alternative}`,
    title: `${alternative[0].toUpperCase() + alternative.slice(1)} concept · ${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}`,
    units: 'ft',
    plot: { width, depth },
    building,
    rooms,
    metadata: { bedrooms, alternative, generatedBy: 'juno-deterministic-v1' },
  };
  const errors = validatePlan(plan);
  if (errors.length) throw new Error(`Could not generate valid starter layout: ${errors.join(' ')}`);
  return plan;
}

/** Validates positive dimensions, plot/building bounds, unique IDs, and room overlaps. */
export function validatePlan(plan: PlanModel): string[] {
  const errors: string[] = [];
  const { width, depth } = plan.plot;
  if (!(width > 0 && depth > 0)) errors.push('Plot dimensions must be positive.');
  const rects = [plan.building, ...plan.rooms];
  for (const [i, r] of rects.entries()) {
    if (![r.x, r.y, r.width, r.height].every(Number.isFinite) || r.width <= 0 || r.height <= 0) errors.push(`Rectangle ${i} has invalid dimensions.`);
    if (r.x < -EPSILON || r.y < -EPSILON || r.x + r.width > width + EPSILON || r.y + r.height > depth + EPSILON) errors.push(`Rectangle ${i} exceeds plot boundaries.`);
  }
  for (const room of plan.rooms) {
    if (room.x < plan.building.x - EPSILON || room.y < plan.building.y - EPSILON ||
        room.x + room.width > plan.building.x + plan.building.width + EPSILON ||
        room.y + room.height > plan.building.y + plan.building.height + EPSILON) {
      errors.push('Room ' + room.id + ' exceeds building boundaries.');
    }
  }
  const ids = plan.rooms.map(r => r.id);
  if (new Set(ids).size !== ids.length) errors.push('Room IDs must be unique.');
  for (let i = 0; i < plan.rooms.length; i++) for (let j = i + 1; j < plan.rooms.length; j++) {
    const a = plan.rooms[i], b = plan.rooms[j];
    const overlapW = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapH = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    if (overlapW > EPSILON && overlapH > EPSILON) errors.push(`Rooms ${a.id} and ${b.id} overlap.`);
  }
  return [...new Set(errors)];
}

/** Returns square footage for a room or the entire room set. */
export function roomArea(room: Rect): number { return room.width * room.height; }
export function totalRoomArea(plan: PlanModel): number { return plan.rooms.reduce((sum, room) => sum + roomArea(room), 0); }
