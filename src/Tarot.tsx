import { useHighlight } from "./HighlightContext";
import cupIcon from "./assets/cup.svg";
import kingIcon from "./assets/king.svg";
import knightIcon from "./assets/knight.svg";
import pageIcon from "./assets/page.svg";
import pentacleIcon from "./assets/pentacle.svg";
import queenIcon from "./assets/queen.svg";
import swordIcon from "./assets/sword.svg";
import trumpIcon from "./assets/trump.svg";
import wandIcon from "./assets/wand.svg";

type TarotProps = {
  x?: number;
  y?: number;
  width: number;
  height: number;
};

function Tarot({ x = 0, y = 0, width, height }: TarotProps) {
  const { highlighted, setSelected } = useHighlight();

  const isSuitHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "suit" && i === index);

  const isTrumpHighlighted = () =>
    highlighted.some(([type, i]) => type === "trump" && i === 0);

  const isMajorArcanaHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "majorArcana" && i === index);

  const isMinorArcanaHighlighted = (index: number) =>
    highlighted.some(([type, i]) => type === "minorArcana" && i === index);
  const majorWidth = width / 3;
  const minorWidth = width - majorWidth;
  const majorRows = 4;
  const majorCols = 7;
  const majorRowHeight = height / majorRows;
  const minorRows = 4;
  const minorCols = 15;
  const baseMajorColWidth = majorWidth / majorCols;
  const baseMinorColWidth = minorWidth / minorCols;
  const columnGap = Math.min(baseMajorColWidth, baseMinorColWidth) * 0.19;
  const sectionGutter = columnGap * 0.5;
  const minorRowHeight = height / minorRows;
  const minorAvailableWidth = minorWidth - sectionGutter;
  const majorCardWidth = (majorWidth - (majorCols + 1) * columnGap) / majorCols;
  const minorCardWidth =
    (minorAvailableWidth - (minorCols + 1) * columnGap) / minorCols;
  const majorPadding = columnGap;
  const minorPadding = columnGap;
  const trumpCenterX = columnGap + majorCardWidth / 2;
  const trumpCenterY = majorRowHeight / 2;
  const trumpRadius = Math.min(majorCardWidth, majorRowHeight) * 0.52;
  const majorCardHeight = majorRowHeight - majorPadding * 2;
  const majorCornerRadius = Math.min(majorCardWidth, majorCardHeight) * 0.18;
  const minorCornerRadius = Math.min(minorCardWidth, minorRowHeight) * 0.18;
  const majorNumbers = [
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21],
  ];
  const minorSuits = ["W", "C", "S", "P"];
  const minorSuitIcons: Record<string, string> = {
    W: wandIcon,
    C: cupIcon,
    S: swordIcon,
    P: pentacleIcon,
  };
  const minorRanks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "p",
    "k",
    "Q",
    "K",
  ];
  const courtCardIcons: Record<string, string> = {
    p: pageIcon,
    k: knightIcon,
    Q: queenIcon,
    K: kingIcon,
  };

  return (
    <svg
      x={x}
      y={y}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="tarot"
    >
      <g
        onMouseEnter={() => setSelected(["trump", 0])}
        onMouseLeave={() => setSelected(null)}
      >
        <circle
          cx={trumpCenterX}
          cy={trumpCenterY}
          r={trumpRadius}
          className={`tarot-trump ${isTrumpHighlighted() ? "tarot-trump-selected" : ""}`}
        />
        <image
          href={trumpIcon}
          x={trumpCenterX - trumpRadius * 0.7}
          y={trumpCenterY - trumpRadius * 0.7}
          width={trumpRadius * 1.4}
          height={trumpRadius * 1.4}
          preserveAspectRatio="xMidYMid meet"
          className={isTrumpHighlighted() ? "tarot-trump-icon-selected" : ""}
        />
      </g>
      {majorNumbers.map((rowNumbers, row) =>
        rowNumbers.map((cardNumber, col) => {
          const columnIndex = col + 1;
          const xPos = columnGap + columnIndex * (majorCardWidth + columnGap);
          const yPos = row * majorRowHeight + majorPadding;
          const labelX = xPos + majorCardWidth / 2;
          const labelY = row * majorRowHeight + majorRowHeight / 2;
          return (
            <g
              key={`${row}-${col}`}
              onMouseEnter={() => setSelected(["majorArcana", cardNumber])}
              onMouseLeave={() => setSelected(null)}
            >
              <rect
                x={xPos}
                y={yPos}
                width={majorCardWidth}
                height={majorCardHeight}
                rx={majorCornerRadius}
                ry={majorCornerRadius}
                className={`tarot-card ${isMajorArcanaHighlighted(cardNumber) ? "tarot-card-selected" : ""}`}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`tarot-card-number ${isMajorArcanaHighlighted(cardNumber) ? "tarot-card-number-selected" : ""}`}
              >
                {cardNumber}
              </text>
            </g>
          );
        }),
      )}
      {minorSuits.map((suit, row) =>
        Array.from({ length: minorCols }, (_, col) => {
          const label = col === 0 ? suit : minorRanks[col - 1];
          const xPos =
            majorWidth +
            sectionGutter +
            columnGap +
            col * (minorCardWidth + columnGap);
          const yPos = row * minorRowHeight + minorPadding;
          const cardHeight = minorRowHeight - minorPadding * 2;
          const labelX = xPos + minorCardWidth / 2;
          const labelY = row * minorRowHeight + minorRowHeight / 2;
          const suitRadius = Math.min(minorCardWidth, minorRowHeight) * 0.52;
          const suitSize = suitRadius * 1.4;
          const suitIcon = minorSuitIcons[suit];
          return (
            <g key={`minor-${row}-${col}`}>
              {col === 0 ? (
                <g
                  onMouseEnter={() => setSelected(["suit", row])}
                  onMouseLeave={() => setSelected(null)}
                >
                  <circle
                    cx={labelX}
                    cy={labelY}
                    r={suitRadius}
                    className={`tarot-suit ${isSuitHighlighted(row) ? "tarot-suit-selected" : ""}`}
                  />
                  <image
                    href={suitIcon}
                    x={labelX - suitSize / 2}
                    y={labelY - suitSize / 2}
                    width={suitSize}
                    height={suitSize}
                    preserveAspectRatio="xMidYMid meet"
                    className={isSuitHighlighted(row) ? "tarot-suit-icon-selected" : ""}
                  />
                </g>
              ) : (
                <g
                  onMouseEnter={() => setSelected(["minorArcana", row * 14 + (col - 1)])}
                  onMouseLeave={() => setSelected(null)}
                >
                  <rect
                    x={xPos}
                    y={yPos}
                    width={minorCardWidth}
                    height={cardHeight}
                    rx={minorCornerRadius}
                    ry={minorCornerRadius}
                    className={`tarot-card ${isMinorArcanaHighlighted(row * 14 + (col - 1)) ? "tarot-card-selected" : ""}`}
                  />
                  {courtCardIcons[label] ? (
                    <image
                      href={courtCardIcons[label]}
                      x={labelX - minorCardWidth * 0.3}
                      y={labelY - cardHeight * 0.3}
                      width={minorCardWidth * 0.6}
                      height={cardHeight * 0.6}
                      preserveAspectRatio="xMidYMid meet"
                      className={isMinorArcanaHighlighted(row * 14 + (col - 1)) ? "tarot-card-icon-selected" : ""}
                    />
                  ) : (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`tarot-card-number ${isMinorArcanaHighlighted(row * 14 + (col - 1)) ? "tarot-card-number-selected" : ""}`}
                    >
                      {label}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

export default Tarot;
