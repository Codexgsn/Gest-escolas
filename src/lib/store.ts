
import { create } from 'zustand';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';

interface LayoutStore {
  isOpen: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  getState: () => 'expanded' | 'collapsed';
}

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  isOpen: true, 
  isMobileOpen: false,
  isMobile: false, // Será sincronizado pelo ViewportSync
  toggle: () => {
    if (get().isMobile) {
      set({ isMobileOpen: !get().isMobileOpen });
    } else {
      const newIsOpen = !get().isOpen;
      set({ isOpen: newIsOpen });
      if (typeof document !== 'undefined') {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${newIsOpen}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
    }
  },
  setOpen: (open) => {
    set({ isOpen: open });
    if (typeof document !== 'undefined') {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  },
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  setIsMobile: (isMobile) => set({ isMobile }),
  getState: () => get().isOpen ? 'expanded' : 'collapsed',
}));
