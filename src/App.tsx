import "./App.css";
import Elements, { ELEMENTS_VIEWBOX } from "./Elements";
import Planets, { PLANETS_LAYOUT } from "./Planets";
import TreeOfLife, { TREE_VIEWBOX } from "./TreeOfLife";

function App() {
  const diagramWidth =
    ELEMENTS_VIEWBOX.width +
    TREE_VIEWBOX.width +
    PLANETS_LAYOUT.viewBoxWidth;
  const diagramHeight = Math.max(
    ELEMENTS_VIEWBOX.height,
    TREE_VIEWBOX.height,
    PLANETS_LAYOUT.viewBoxHeight,
  );
  const elementsY = (diagramHeight - ELEMENTS_VIEWBOX.height) / 2;
  const treeY = (diagramHeight - TREE_VIEWBOX.height) / 2;
  const planetsY = (diagramHeight - PLANETS_LAYOUT.viewBoxHeight) / 2;
  const treeX = ELEMENTS_VIEWBOX.width;
  const planetsX = treeX + TREE_VIEWBOX.width;

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
        </svg>
      </div>
    </div>
  );
}

export default App;
