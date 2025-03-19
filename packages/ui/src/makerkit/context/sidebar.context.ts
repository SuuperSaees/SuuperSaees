import { createContext } from 'react';


const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  itemActiveStyle?: React.CSSProperties;
  openGroupId: string | null;
  setOpenGroupId: (id: string | null) => void;
}>({
  collapsed: false,
  setCollapsed: (_) => _,
  openGroupId: null,
  setOpenGroupId: (_) => _,
});

export { SidebarContext };