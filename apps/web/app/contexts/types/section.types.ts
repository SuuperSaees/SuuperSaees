import { Dispatch, SetStateAction, type JSX } from "react";

export type TriggersMap = Map<string, JSX.Element | null>;

export type ViewsMap =  Map<string, JSX.Element>

export interface SectionContextType<T> {
  section: T;
  views: ViewsMap;
  triggers?: TriggersMap;
  setSection:  Dispatch<SetStateAction<T>>
}
