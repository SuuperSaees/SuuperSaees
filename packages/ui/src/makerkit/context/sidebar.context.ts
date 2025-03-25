import { createContext } from 'react';


const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  itemActiveStyle?: React.CSSProperties;
  itemHoverStyle?: React.CSSProperties;
  openGroupId: string | null;
  setOpenGroupId: (id: string | null) => void;
  sidebarColor: string;
}>({
  collapsed: false,
  setCollapsed: (_) => _,
  openGroupId: null,
  setOpenGroupId: (_) => _,
  sidebarColor: '#ffffff',
});

export { SidebarContext };