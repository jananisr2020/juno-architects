import type { PlanModel, Room } from '../lib/plan-model';

type Props = { plan: PlanModel; floors: number };

const fill: Record<Room['kind'], string> = {
  living: '#dce8df', bedroom: '#e8e1d2', kitchen: '#dbe5ef',
  bathroom: '#e7dfe9', circulation: '#eeeeea',
};

/** Isometric SVG massing view derived from the canonical plan footprint and room rectangles. */
export default function MassingView({ plan, floors }: Props) {
  const scale = Math.min(5.2, 230 / Math.max(plan.plot.width, plan.plot.depth));
  const zScale = scale * 0.9;
  const ox = 310;
  const oy = 42;
  const project = (x: number, y: number, z: number) => ({
    x: ox + (x - y) * scale,
    y: oy + (x + y) * scale * 0.43 - z * zScale,
  });
  const pointString = (points: Array<{x:number;y:number}>) => points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const { x, y, width, height } = plan.building;
  const z = Math.max(1, floors) * 9.2;
  const a = project(x, y, 0), b = project(x + width, y, 0), c = project(x + width, y + height, 0);
  const at = project(x, y, z), bt = project(x + width, y, z), ct = project(x + width, y + height, z), dt = project(x, y + height, z);
  const orderedRooms = [...plan.rooms].sort((r1, r2) => (r1.x + r1.y) - (r2.x + r2.y));
  return <div className="massing-frame">
    <svg viewBox="0 0 620 430" role="img" aria-label={`Isometric massing concept derived from the ${plan.plot.width} by ${plan.plot.depth} foot plot, showing ${floors} floor${floors > 1 ? 's' : ''} and ${plan.rooms.length} room zones`}>
      <defs><linearGradient id="massing-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f8f7f1"/><stop offset="100%" stopColor="#e8eee7"/></linearGradient></defs>
      <rect width="620" height="430" rx="14" fill="url(#massing-sky)"/>
      <polygon points={pointString([project(0,0,0),project(plan.plot.width,0,0),project(plan.plot.width,plan.plot.depth,0),project(0,plan.plot.depth,0)])} fill="#e2e5da" stroke="#a4b0a3" strokeWidth="1.2"/>
      {orderedRooms.map(room => {
        const ra = project(room.x, room.y, z), rb = project(room.x + room.width, room.y, z);
        const rc = project(room.x + room.width, room.y + room.height, z), rd = project(room.x, room.y + room.height, z);
        const rbf = project(room.x + room.width, room.y, 0), rcf = project(room.x + room.width, room.y + room.height, 0), rdf = project(room.x, room.y + room.height, 0);
        return <g key={room.id}>
          <polygon points={pointString([rb,rc,rcf,rbf])} fill="#b8c8bb" stroke="#536a59" strokeWidth=".8"/>
          <polygon points={pointString([rd,rc,rcf,rdf])} fill="#8fa995" stroke="#536a59" strokeWidth=".8"/>
          <polygon points={pointString([ra,rb,rc,rd])} fill={fill[room.kind]} fillOpacity=".88" stroke="#536a59" strokeWidth=".8"/>
        </g>;
      })}
      <polygon points={pointString([a,b,bt,at])} fill="#6e8875" fillOpacity=".45" stroke="#40594b" strokeWidth="1"/>
      <polygon points={pointString([b,c,ct,bt])} fill="#5d7865" fillOpacity=".55" stroke="#40594b" strokeWidth="1"/>
      <polygon points={pointString([at,bt,ct,dt])} fill="#d8e4d8" fillOpacity=".6" stroke="#40594b" strokeWidth="1.6"/>
      {Array.from({length: Math.max(0, floors - 1)}, (_, i) => {
        const floorZ = (i + 1) * 9.2;
        const p1 = project(x,y,floorZ), p2 = project(x+width,y,floorZ), p3 = project(x+width,y+height,floorZ), p4 = project(x,y+height,floorZ);
        return <polygon key={floorZ} points={pointString([p1,p2,p3,p4])} fill="none" stroke="#647f6b" strokeDasharray="4 3" strokeWidth="1.4"/>;
      })}
      <text x="22" y="28" fill="#314b3b" fontSize="12" fontWeight="600">CONCEPT MASSING · NOT A CONSTRUCTION MODEL</text>
      <text x="22" y="405" fill="#526457" fontSize="12">{plan.building.width.toFixed(1)} × {plan.building.height.toFixed(1)} ft footprint · {floors} floor{floors > 1 ? 's' : ''} · {plan.rooms.length} room zones</text>
    </svg>
    <p className="plan-warning">Isometric block model derived from the same measured footprint and room zones. Floor height is illustrative; it does not represent structural design, openings, stairs, or code compliance.</p>
  </div>;
}
