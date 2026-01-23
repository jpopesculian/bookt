import db from "./db.json";
import { useHighlight } from "./HighlightContext";

const planetSymbols: Record<string, string> = {
  Neptune: "Y",
  Uranus: "X",
  Saturn: "W",
  Jupiter: "V",
  Mars: "U",
  Sun: "Q",
  Venus: "T",
  Mercury: "S",
  Moon: "R",
  Earth: ">",
};

const zodiacSymbols: Record<string, string> = {
  Aries: "A",
  Taurus: "B",
  Gemini: "C",
  Cancer: "D",
  Leo: "E",
  Virgo: "F",
  Libra: "G",
  Scorpio: "H",
  Sagittarius: "I",
  Capricorn: "J",
  Aquarius: "K",
  Pisces: "L",
};

const MODALITY_SIZE = 18;
const MODALITY_CIRCLE_R = 3;
const MODALITY_STROKE = 1.5;
const MODALITY_BACKING_R = 20;

type ModalitySymbolProps = { x: number; y: number; highlighted?: boolean };

function CardinalSymbol({ x, y, highlighted }: ModalitySymbolProps) {
  const s = MODALITY_SIZE;
  const h = s;
  const w = (s * 2) / Math.sqrt(3);
  const topY = y - h / 2 + 2;
  const bottomY = y + h / 3 + 2;
  const innerCircleY = y + 4;
  const strokeColor = highlighted ? "white" : "black";
  return (
    <g className="modality-symbol">
      <circle
        cx={x}
        cy={y + 2}
        r={MODALITY_BACKING_R}
        className={`modality-backing ${highlighted ? "modality-backing-selected" : ""}`}
      />
      <path
        d={`M ${x - w / 2} ${bottomY} L ${x} ${topY} L ${x + w / 2} ${bottomY}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={MODALITY_STROKE}
      />
      <circle
        cx={x}
        cy={innerCircleY}
        r={MODALITY_CIRCLE_R}
        fill="none"
        stroke={strokeColor}
        strokeWidth={MODALITY_STROKE}
      />
    </g>
  );
}

function FixedSymbol({ x, y, highlighted }: ModalitySymbolProps) {
  const w = MODALITY_SIZE;
  const h = MODALITY_SIZE;
  const lineLen = w * 0.4;
  const strokeColor = highlighted ? "white" : "black";
  return (
    <g className="modality-symbol">
      <circle
        cx={x}
        cy={y}
        r={MODALITY_BACKING_R}
        className={`modality-backing ${highlighted ? "modality-backing-selected" : ""}`}
      />
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        fill="none"
        stroke={strokeColor}
        strokeWidth={MODALITY_STROKE}
      />
      <line
        x1={x - lineLen / 2}
        y1={y}
        x2={x + lineLen / 2}
        y2={y}
        stroke={strokeColor}
        strokeWidth={MODALITY_STROKE}
      />
    </g>
  );
}

function MutableSymbol({ x, y, highlighted }: ModalitySymbolProps) {
  const r = MODALITY_SIZE * 0.6;
  const symbolY = y - 2;
  const baseY = symbolY + r / 2;
  const strokeColor = highlighted ? "white" : "black";
  return (
    <g className="modality-symbol">
      <circle
        cx={x}
        cy={y}
        r={MODALITY_BACKING_R}
        className={`modality-backing ${highlighted ? "modality-backing-selected" : ""}`}
      />
      <path
        d={`M ${x - r} ${baseY} A ${r} ${r} 0 0 1 ${x + r} ${baseY}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={MODALITY_STROKE}
      />
      <circle
        cx={x}
        cy={baseY}
        r={MODALITY_CIRCLE_R}
        fill="none"
        stroke={strokeColor}
        strokeWidth={MODALITY_STROKE}
      />
    </g>
  );
}

const modalityComponents: Record<string, React.FC<ModalitySymbolProps>> = {
  Cardinal: CardinalSymbol,
  Fixed: FixedSymbol,
  Mutable: MutableSymbol,
};

const PLANET_BASE_RADIUS = 10;
const PLANET_SPIRAL_SPACING = 18;
const PLANET_SPIRAL_OFFSET = PLANET_SPIRAL_SPACING * 0.5;
const PLANET_SPIRAL_TURNS = 2;
const PLANET_SPIRAL_SAMPLES = 140;
const DECAN_RING_OFFSET = 6;
const DECAN_RING_WIDTH = 12;
const ZODIAC_RING_OFFSET = 0;
const ZODIAC_RING_WIDTH = 22;
const MODALITY_ROW_HEIGHT = 50;
const TARGET_HEIGHT = 620;

const classicalPlanets = db.planets.filter((p) => p.classical);
const modernPlanets = db.planets.filter(
  (p) => !p.classical && p.name !== "Earth",
);
const spiralPlanets = [...modernPlanets, ...classicalPlanets];
const earthPlanet = db.planets.find((p) => p.name === "Earth");

const getPlanetsLayout = (planetCount: number) => {
  const lastPlanetRadius =
    PLANET_BASE_RADIUS +
    PLANET_SPIRAL_OFFSET +
    (planetCount - 1) * PLANET_SPIRAL_SPACING;
  const outerRadius = lastPlanetRadius + PLANET_SPIRAL_OFFSET;
  const decanInnerRadius = outerRadius + DECAN_RING_OFFSET;
  const decanOuterRadius = decanInnerRadius + DECAN_RING_WIDTH;
  const zodiacInnerRadius = decanOuterRadius + ZODIAC_RING_OFFSET;
  const zodiacOuterRadius = zodiacInnerRadius + ZODIAC_RING_WIDTH;
  const zodiacRadius = (zodiacInnerRadius + zodiacOuterRadius) / 2;
  const circleDiameter = (zodiacOuterRadius + 10) * 2;
  const viewBoxWidth = circleDiameter;
  const viewBoxHeight = TARGET_HEIGHT;
  return {
    decanInnerRadius,
    decanOuterRadius,
    zodiacInnerRadius,
    zodiacOuterRadius,
    zodiacRadius,
    circleDiameter,
    viewBoxWidth,
    viewBoxHeight,
  };
};

export const PLANETS_LAYOUT = getPlanetsLayout(spiralPlanets.length);

type SvgOffsetProps = {
  x?: number;
  y?: number;
};

function Planets({ x = 0, y = 0 }: SvgOffsetProps) {
  const { highlighted, setSelected } = useHighlight();
  const {
    decanInnerRadius,
    decanOuterRadius,
    zodiacInnerRadius,
    zodiacOuterRadius,
    zodiacRadius,
    viewBoxWidth,
    viewBoxHeight,
  } = PLANETS_LAYOUT;
  const decanStep = (2 * Math.PI) / 36;
  const decanStart = -Math.PI / 2;
  const centerX = viewBoxWidth / 2;
  const circleAreaHeight = viewBoxHeight - MODALITY_ROW_HEIGHT;
  const centerY = MODALITY_ROW_HEIGHT + circleAreaHeight / 2;
  const zodiacStep = (2 * Math.PI) / db.zodiac.length;
  const zodiacStart = -Math.PI / 2;
  const planetCount = spiralPlanets.length;
  const spiralStart = -Math.PI / 2;
  const totalAngle = planetCount > 1 ? Math.PI * 2 * PLANET_SPIRAL_TURNS : 0;
  const angleStep = planetCount > 1 ? totalAngle / (planetCount - 1) : 0;
  const spiralRadiusSpan = PLANET_SPIRAL_SPACING * (planetCount - 1);
  const spiralPath =
    planetCount > 1
      ? Array.from({ length: PLANET_SPIRAL_SAMPLES }, (_, index) => {
          const t = index / (PLANET_SPIRAL_SAMPLES - 1);
          const angle = spiralStart + t * totalAngle;
          const radius =
            PLANET_BASE_RADIUS + PLANET_SPIRAL_OFFSET + t * spiralRadiusSpan;
          const xPos = centerX + Math.cos(angle) * radius;
          const yPos = centerY + Math.sin(angle) * radius;
          return `${index === 0 ? "M" : "L"} ${xPos} ${yPos}`;
        }).join(" ")
      : "";

  const modalitySpacing = viewBoxWidth / (db.modalities.length + 1);
  const modalityY = centerY - zodiacOuterRadius - 50;

  const isModalityHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "modality" && i === index);

  const isPlanetHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "planet" && i === index);

  const isZodiacHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "zodiac" && i === index);

  const isDecanHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "decan" && i === index);

  const earthIndex = db.planets.findIndex((p) => p.name === "Earth");

  return (
    <svg
      x={x}
      y={y}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      width={viewBoxWidth}
      height={viewBoxHeight}
      className="planets"
    >
      {db.modalities.map((modality, i) => {
        const ModalityComponent = modalityComponents[modality.name];
        return (
          <g
            key={i}
            onMouseEnter={() => setSelected(["modality", i])}
            onMouseLeave={() => setSelected(null)}
            onClick={() => console.log("click modality", i, modality)}
            style={{ cursor: "pointer" }}
          >
            <ModalityComponent
              x={modalitySpacing * (i + 1)}
              y={modalityY}
              highlighted={isModalityHighlighted(i)}
            />
          </g>
        );
      })}
      <circle
        cx={centerX}
        cy={centerY}
        r={PLANET_BASE_RADIUS}
        className={`planet-filled ${isPlanetHighlighted(earthIndex) ? "planet-filled-selected" : ""}`}
        onMouseEnter={() => setSelected(["planet", earthIndex])}
        onMouseLeave={() => setSelected(null)}
      />
      {earthPlanet && (
        <text
          x={centerX}
          y={centerY}
          className={`planet-symbol earth-symbol ${isPlanetHighlighted(earthIndex) ? "earth-symbol-selected" : ""}`}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ pointerEvents: "none" }}
        >
          {planetSymbols[earthPlanet.name]}
        </text>
      )}
      {spiralPath ? <path d={spiralPath} className="planet-spiral" /> : null}
      {[...spiralPlanets].reverse().map((planet, i) => {
        const planetIndex = db.planets.findIndex((p) => p.name === planet.name);
        const radius =
          PLANET_BASE_RADIUS + PLANET_SPIRAL_OFFSET + i * PLANET_SPIRAL_SPACING;
        const angle = spiralStart + i * angleStep;
        const xPos = centerX + Math.cos(angle) * radius;
        const yPos = centerY + Math.sin(angle) * radius;
        const isHighlighted = isPlanetHighlighted(planetIndex);
        const backingClass = planet.classical
          ? `planet-backing ${isHighlighted ? "planet-backing-selected" : ""}`
          : `planet-backing planet-backing-modern ${isHighlighted ? "planet-backing-selected" : ""}`;
        return (
          <g
            key={i}
            onMouseEnter={() => setSelected(["planet", planetIndex])}
            onMouseLeave={() => setSelected(null)}
          >
            <circle cx={xPos} cy={yPos} r={10} className={backingClass} />
            <text
              x={xPos}
              y={yPos}
              className={`planet-symbol ${isHighlighted ? "planet-symbol-selected" : ""}`}
              textAnchor="middle"
              dominantBaseline="central"
              onClick={() => console.log("click planet", i, planet)}
            >
              {planetSymbols[planet.name]}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 36 }).map((_, i) => {
        const startAngle = decanStart + i * decanStep;
        const endAngle = decanStart + (i + 1) * decanStep;
        const isHighlighted = isDecanHighlighted(i);

        const innerStart = {
          x: centerX + Math.cos(startAngle) * decanInnerRadius,
          y: centerY + Math.sin(startAngle) * decanInnerRadius,
        };
        const innerEnd = {
          x: centerX + Math.cos(endAngle) * decanInnerRadius,
          y: centerY + Math.sin(endAngle) * decanInnerRadius,
        };
        const outerStart = {
          x: centerX + Math.cos(startAngle) * decanOuterRadius,
          y: centerY + Math.sin(startAngle) * decanOuterRadius,
        };
        const outerEnd = {
          x: centerX + Math.cos(endAngle) * decanOuterRadius,
          y: centerY + Math.sin(endAngle) * decanOuterRadius,
        };

        const segmentPath = `
          M ${innerStart.x} ${innerStart.y}
          A ${decanInnerRadius} ${decanInnerRadius} 0 0 1 ${innerEnd.x} ${innerEnd.y}
          L ${outerEnd.x} ${outerEnd.y}
          A ${decanOuterRadius} ${decanOuterRadius} 0 0 0 ${outerStart.x} ${outerStart.y}
          Z
        `;

        return (
          <path
            key={`decan-segment-${i}`}
            d={segmentPath}
            className={`decan-segment ${isHighlighted ? "decan-segment-selected" : ""}`}
            onMouseEnter={() => setSelected(["decan", i])}
            onMouseLeave={() => setSelected(null)}
            onClick={() => console.log("click decan", i, db.decans[i])}
          />
        );
      })}
      <circle
        cx={centerX}
        cy={centerY}
        r={zodiacInnerRadius}
        className="zodiac-ring"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r={zodiacOuterRadius}
        className="zodiac-ring"
      />
      {db.zodiac.map((_, i) => {
        const angle = zodiacStart + i * zodiacStep;
        const x1 = centerX + Math.cos(angle) * zodiacInnerRadius;
        const y1 = centerY + Math.sin(angle) * zodiacInnerRadius;
        const x2 = centerX + Math.cos(angle) * zodiacOuterRadius;
        const y2 = centerY + Math.sin(angle) * zodiacOuterRadius;
        return (
          <line
            key={`divider-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="zodiac-divider"
          />
        );
      })}
      {db.zodiac.map((zodiac, i) => {
        const startAngle = zodiacStart + i * zodiacStep;
        const endAngle = zodiacStart + (i + 1) * zodiacStep;
        const midAngle = zodiacStart + (i + 0.5) * zodiacStep;
        const xPos = centerX + Math.cos(midAngle) * zodiacRadius;
        const yPos = centerY + Math.sin(midAngle) * zodiacRadius;
        const isHighlighted = isZodiacHighlighted(i);

        // Create arc segment path
        const innerStart = {
          x: centerX + Math.cos(startAngle) * zodiacInnerRadius,
          y: centerY + Math.sin(startAngle) * zodiacInnerRadius,
        };
        const innerEnd = {
          x: centerX + Math.cos(endAngle) * zodiacInnerRadius,
          y: centerY + Math.sin(endAngle) * zodiacInnerRadius,
        };
        const outerStart = {
          x: centerX + Math.cos(startAngle) * zodiacOuterRadius,
          y: centerY + Math.sin(startAngle) * zodiacOuterRadius,
        };
        const outerEnd = {
          x: centerX + Math.cos(endAngle) * zodiacOuterRadius,
          y: centerY + Math.sin(endAngle) * zodiacOuterRadius,
        };

        const segmentPath = `
          M ${innerStart.x} ${innerStart.y}
          A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 1 ${innerEnd.x} ${innerEnd.y}
          L ${outerEnd.x} ${outerEnd.y}
          A ${zodiacOuterRadius} ${zodiacOuterRadius} 0 0 0 ${outerStart.x} ${outerStart.y}
          Z
        `;

        return (
          <g
            key={i}
            onMouseEnter={() => setSelected(["zodiac", i])}
            onMouseLeave={() => setSelected(null)}
            onClick={() => console.log("click zodiac", i, zodiac)}
          >
            <path
              d={segmentPath}
              className={`zodiac-segment ${isHighlighted ? "zodiac-segment-selected" : ""}`}
            />
            <text
              x={xPos}
              y={yPos}
              className={`zodiac-symbol ${isHighlighted ? "zodiac-symbol-selected" : ""}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {zodiacSymbols[zodiac.name]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default Planets;
