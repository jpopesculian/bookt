import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type HighlightType =
  | "element"
  | "sephirah"
  | "path"
  | "planet"
  | "decan"
  | "zodiac"
  | "modality";

export type HighlightItem = [HighlightType, number];

type HighlightContextType = {
  selected: HighlightItem | null;
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
      // For now, just highlight the selected item
      // This can be extended to compute related items based on db relationships
      setHighlighted([item]);
    }
  }, []);

  return (
    <HighlightContext.Provider value={{ selected, highlighted, setSelected }}>
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
