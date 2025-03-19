import { createContext } from 'react';


const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  itemActiveStyle?: React.CSSProperties;
}>({
  collapsed: false,
  setCollapsed: (_) => _,
});

export { SidebarContext };