import db from "./db.json";
import { useHighlight } from "./HighlightContext";

const elementSymbols: Record<string, string> = {
  Fire: "±",
  Air: "²",
  Water: "³",
  Earth: "´",
};

export const ELEMENTS_VIEWBOX = { width: 50, height: 620 };

const ELEMENTS_SPREAD = 480;
const ELEMENTS_START = (620 - ELEMENTS_SPREAD) / 2;

type SvgOffsetProps = {
  x?: number;
  y?: number;
};

function Elements({ x = 0, y = 0 }: SvgOffsetProps) {
  const { highlighted, setSelected } = useHighlight();

  const isHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "element" && i === index);

  return (
    <svg
      x={x}
      y={y}
      viewBox={`0 0 ${ELEMENTS_VIEWBOX.width} ${ELEMENTS_VIEWBOX.height}`}
      width={ELEMENTS_VIEWBOX.width}
      height={ELEMENTS_VIEWBOX.height}
      className="elements"
    >
      {db.elements.map((element, i) => {
        const yPos =
          ELEMENTS_START + i * (ELEMENTS_SPREAD / (db.elements.length - 1));
        const textOffset =
          element.name === "Fire" || element.name === "Air" ? -3 : 0;
        const highlighted = isHighlighted(i);
        return (
          <g
            key={i}
            onMouseEnter={() => setSelected(["element", i])}
            onMouseLeave={() => setSelected(null)}
            onClick={() => console.log("click element", i, element)}
          >
            <circle
              cx={25}
              cy={yPos}
              r={22}
              className={`element-backing ${highlighted ? "element-backing-selected" : ""}`}
            />
            <text
              x={25}
              y={yPos + textOffset}
              className={`element ${highlighted ? "element-selected" : ""}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {elementSymbols[element.name]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default Elements;
