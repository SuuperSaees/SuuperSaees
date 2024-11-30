'use client';

/**
@description This section is used to manage the state of the current section
 */
import { createContext, useContext, useState } from 'react';

import { SectionContextType, ViewsMap, TriggersMap } from './types/section.types';

import Tabs from '../components/accounts/tabs';
import Header from '../components/accounts/header';
// The any in this case is justified because the state type is not known at compile time
// So the any would be only for the initial state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SectionContext = createContext<SectionContextType<any> | undefined>(undefined);

export function Section<T>({
  state,
  views,
  triggers,
  children
}: {
  children: React.ReactNode;
  state: T;
  views: ViewsMap;
  triggers?: TriggersMap;

}) {
  const [section, setSection] = useState<T>(state);  

  return ( 
    <SectionContext.Provider value={{ section, views, triggers, setSection }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection<T>() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSection must be used within a Section');
  }
  return context as SectionContextType<T>;
}


Section.Tabs = Tabs;
Section.Header = Header;