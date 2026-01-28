import "./App.css";
import Elements, { ELEMENTS_VIEWBOX } from "./Elements";
import Planets, { PLANETS_LAYOUT } from "./Planets";
import Tarot from "./Tarot";
import TreeOfLife, { TREE_VIEWBOX } from "./TreeOfLife";

function App() {
  const diagramWidth =
    ELEMENTS_VIEWBOX.width +
    TREE_VIEWBOX.width +
    PLANETS_LAYOUT.viewBoxWidth;
  const baseHeight = Math.max(
    ELEMENTS_VIEWBOX.height,
    TREE_VIEWBOX.height,
    PLANETS_LAYOUT.viewBoxHeight,
  );
  const diagramHeight = Math.max(baseHeight, diagramWidth);
  const tarotHeight = Math.max(0, diagramHeight - baseHeight);
  const elementsY = 0;
  const treeY = 0;
  const planetsY = 0;
  const treeX = ELEMENTS_VIEWBOX.width;
  const planetsX = treeX + TREE_VIEWBOX.width;
  const tarotX = 0;
  const tarotY = baseHeight;
  const tarotWidth = diagramWidth;

  return (
    <div className="app">
      <div className="diagram">
        <svg
          viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
          className="diagram-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <Elements x={0} y={elementsY} />
          <TreeOfLife x={treeX} y={treeY} />
          <Planets x={planetsX} y={planetsY} />
          {tarotHeight > 0 ? (
            <Tarot
              x={tarotX}
              y={tarotY}
              width={tarotWidth}
              height={tarotHeight}
            />
          ) : null}
        </svg>
      </div>
    </div>
  );
}

export default App;
