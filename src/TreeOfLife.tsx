import db from "./db.json";
import { useHighlight } from "./HighlightContext";

const sephirothPositions = [
  { x: 200, y: 40 },
  { x: 320, y: 100 },
  { x: 80, y: 100 },
  { x: 320, y: 220 },
  { x: 80, y: 220 },
  { x: 200, y: 280 },
  { x: 320, y: 400 },
  { x: 80, y: 400 },
  { x: 200, y: 460 },
  { x: 200, y: 560 },
];

export const TREE_VIEWBOX = { width: 400, height: 620 };

type SvgOffsetProps = {
  x?: number;
  y?: number;
};

function TreeOfLife({ x = 0, y = 0 }: SvgOffsetProps) {
  const { highlighted, setSelected } = useHighlight();

  const isSephirahHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "sephirah" && i === index);

  const isPathHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "path" && i === index);

  return (
    <svg
      x={x}
      y={y}
      viewBox={`0 0 ${TREE_VIEWBOX.width} ${TREE_VIEWBOX.height}`}
      width={TREE_VIEWBOX.width}
      height={TREE_VIEWBOX.height}
      className="tree"
    >
      {db.paths.map((path, i) => {
        const from = sephirothPositions[path.from];
        const to = sephirothPositions[path.to];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const pathHighlighted = isPathHighlighted(i);
        return (
          <g
            key={i}
            onMouseEnter={() => setSelected(["path", i])}
            onMouseLeave={() => setSelected(null)}
          >
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={`path-border ${pathHighlighted ? "path-border-selected" : ""}`}
            />
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={`path-fill ${pathHighlighted ? "path-fill-selected" : ""}`}
            />
            <circle
              cx={midX}
              cy={midY}
              r={12}
              className={`path-letter-bg ${pathHighlighted ? "path-letter-bg-selected" : ""}`}
            />
            <text
              x={midX}
              y={midY}
              className={`path-letter ${pathHighlighted ? "path-letter-selected" : ""}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {path.hebrew}
            </text>
          </g>
        );
      })}
      {sephirothPositions.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={24}
          className={`sephirah ${isSephirahHighlighted(i) ? "sephirah-selected" : ""}`}
          onMouseEnter={() => setSelected(["sephirah", i])}
          onMouseLeave={() => setSelected(null)}
        />
      ))}
    </svg>
  );
}

export default TreeOfLife;
