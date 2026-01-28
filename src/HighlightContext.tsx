import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import db from "./db.json";

export type HighlightType =
  | "element"
  | "sephirah"
  | "path"
  | "planet"
  | "decan"
  | "zodiac"
  | "modality"
  | "trump"
  | "suit"
  | "majorArcana"
  | "minorArcana";

export type HighlightItem = [HighlightType, number];

type HighlightContextType = {
  selected: HighlightItem | null;
  selectedName: string | undefined;
  highlighted: HighlightItem[];
  setSelected: (item: HighlightItem | null) => void;
};

const HighlightContext = createContext<HighlightContextType | null>(null);

type HighlightProviderProps = {
  children: ReactNode;
};

export function HighlightProvider({ children }: HighlightProviderProps) {
  const [selected, setSelectedState] = useState<HighlightItem | null>(null);
  const [highlighted, setHighlighted] = useState<HighlightItem[]>([]);

  const setSelected = useCallback((item: HighlightItem | null) => {
    setSelectedState(item);
    if (item === null) {
      setHighlighted([]);
    } else {
      const related: HighlightItem[] = [item];

      // When an element is selected, highlight related zodiac signs, paths, suit, and court cards
      if (item[0] === "element") {
        const elementIndex = item[1];
        db.zodiac.forEach((z, i) => {
          if (z.element === elementIndex) {
            related.push(["zodiac", i]);
          }
        });
        db.paths.forEach((p, i) => {
          if ("element" in p && p.element === elementIndex) {
            related.push(["path", i]);
          }
        });
        db.suits.forEach((s, i) => {
          if (s.element === elementIndex) {
            related.push(["suit", i]);
          }
        });
        // Find court cards through tetragrammaton
        db.tetragrammaton.forEach((t, tetIndex) => {
          if (t.element === elementIndex) {
            db.court.forEach((c, courtIndex) => {
              if (c.tetragrammaton === tetIndex) {
                db.minorArcana.forEach((m, i) => {
                  if ("court" in m && m.court === courtIndex) {
                    related.push(["minorArcana", i]);
                  }
                });
              }
            });
          }
        });
      }

      // When a zodiac is selected, highlight its element, modality, decans, and path
      if (item[0] === "zodiac") {
        const zodiacIndex = item[1];
        const zodiac = db.zodiac[zodiacIndex];
        related.push(["element", zodiac.element]);
        related.push(["modality", zodiac.modality]);
        db.decans.forEach((d, i) => {
          if (d.zodiac === zodiacIndex) {
            related.push(["decan", i]);
          }
        });
        db.paths.forEach((p, i) => {
          if ("zodiac" in p && p.zodiac === zodiacIndex) {
            related.push(["path", i]);
          }
        });
      }

      // When a modality is selected, highlight related zodiac signs
      if (item[0] === "modality") {
        const modalityIndex = item[1];
        db.zodiac.forEach((z, i) => {
          if (z.modality === modalityIndex) {
            related.push(["zodiac", i]);
          }
        });
      }

      // When a decan is selected, highlight its planet, zodiac, and minorArcana
      if (item[0] === "decan") {
        const decanIndex = item[1];
        const decan = db.decans[decanIndex];
        related.push(["planet", decan.planet]);
        related.push(["zodiac", decan.zodiac]);
        db.minorArcana.forEach((m, i) => {
          if ("decan" in m && m.decan === decanIndex) {
            related.push(["minorArcana", i]);
          }
        });
      }

      // When a planet is selected, highlight related decans, its sephirah, and path
      if (item[0] === "planet") {
        const planetIndex = item[1];
        const planet = db.planets[planetIndex];
        related.push(["sephirah", planet.sephirah]);
        db.decans.forEach((d, i) => {
          if (d.planet === planetIndex) {
            related.push(["decan", i]);
          }
        });
        db.paths.forEach((p, i) => {
          if ("planet" in p && p.planet === planetIndex) {
            related.push(["path", i]);
          }
        });
      }

      // When a sephirah is selected, highlight its planet, connected paths, and minorArcana
      if (item[0] === "sephirah") {
        const sephirahIndex = item[1];
        db.planets.forEach((p, i) => {
          if (p.sephirah === sephirahIndex) {
            related.push(["planet", i]);
          }
        });
        db.paths.forEach((p, i) => {
          if (p.from === sephirahIndex || p.to === sephirahIndex) {
            related.push(["path", i]);
          }
        });
        // Find pips that map to this sephirah and highlight their minorArcana
        db.pips.forEach((pip, pipIndex) => {
          if (pip.sephirah === sephirahIndex) {
            db.minorArcana.forEach((m, i) => {
              if ("pip" in m && m.pip === pipIndex) {
                related.push(["minorArcana", i]);
              }
            });
          }
        });
      }

      // When trump is selected, highlight all major arcana cards
      if (item[0] === "trump") {
        for (let i = 0; i < 22; i++) {
          related.push(["majorArcana", i]);
        }
      }

      // When a suit is selected, highlight its element and minor arcana cards
      if (item[0] === "suit") {
        const suitIndex = item[1];
        const suit = db.suits[suitIndex];
        related.push(["element", suit.element]);
        // Each suit has 14 cards (A, 2-10, p, k, Q, K)
        for (let i = 0; i < 14; i++) {
          related.push(["minorArcana", suitIndex * 14 + i]);
        }
      }

      // When a minorArcana is selected, highlight its suit, decan (if available), sephirah (if pip), and element (if court)
      if (item[0] === "minorArcana") {
        const suitIndex = Math.floor(item[1] / 14);
        related.push(["suit", suitIndex]);
        const minorArcana = db.minorArcana[item[1]];
        if ("decan" in minorArcana) {
          related.push(["decan", minorArcana.decan as number]);
        }
        if ("pip" in minorArcana) {
          const pip = db.pips[minorArcana.pip as number];
          related.push(["sephirah", pip.sephirah]);
        }
        if ("court" in minorArcana) {
          const court = db.court[minorArcana.court as number];
          const tetragrammaton = db.tetragrammaton[court.tetragrammaton];
          related.push(["element", tetragrammaton.element]);
        }
      }

      // When a majorArcana is selected, highlight the trump and its path
      if (item[0] === "majorArcana") {
        related.push(["trump", 0]);
        related.push(["path", item[1]]);
      }

      // When a path is selected, highlight its sephiroth, majorArcana, and associated element/planet/zodiac
      if (item[0] === "path") {
        const path = db.paths[item[1]];
        related.push(["sephirah", path.from]);
        related.push(["sephirah", path.to]);
        related.push(["majorArcana", item[1]]);
        if ("element" in path) {
          related.push(["element", path.element as number]);
        }
        if ("planet" in path) {
          related.push(["planet", path.planet as number]);
        }
        if ("zodiac" in path) {
          related.push(["zodiac", path.zodiac as number]);
        }
      }

      setHighlighted(related);
    }
  }, []);

  const selectedName = useMemo(() => {
    if (selected === null) return undefined;
    const [type, index] = selected;
    if (type === "element") {
      return db.elements[index].name;
    }
    if (type === "sephirah") {
      return db.sephiroth[index].name;
    }
    if (type === "modality") {
      return db.modalities[index].name;
    }
    if (type === "zodiac") {
      return db.zodiac[index].name;
    }
    if (type === "decan") {
      return `Decan ${index + 1}`;
    }
    if (type === "planet") {
      return db.planets[index].name;
    }
    if (type === "path") {
      return db.paths[index].letter;
    }
    if (type === "suit") {
      return db.suits[index].name;
    }
    if (type === "trump") {
      return "Major Arcana";
    }
    if (type === "majorArcana") {
      return db.majorArcana[index].name;
    }
    if (type === "minorArcana") {
      const minorArcana = db.minorArcana[index];
      const suitName = db.suits[minorArcana.suit].name;
      if ("lord" in minorArcana) {
        return `Lord of ${minorArcana.lord}`;
      }
      if ("pip" in minorArcana) {
        const pipName = db.pips[minorArcana.pip as number].name;
        return `${pipName} of ${suitName}`;
      }
      if ("court" in minorArcana) {
        const courtName = db.court[minorArcana.court as number].name;
        return `${courtName} of ${suitName}`;
      }
    }
    return undefined;
  }, [selected]);

  return (
    <HighlightContext.Provider value={{ selected, selectedName, highlighted, setSelected }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error("useHighlight must be used within a HighlightProvider");
  }
  return context;
}
