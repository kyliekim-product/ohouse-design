import { createContext, useContext } from 'react';

export const PrototypeOverlayContext = createContext<HTMLElement | null>(null);

export function usePrototypeOverlayContainer(): HTMLElement | undefined {
  const container = useContext(PrototypeOverlayContext);
  return container ?? undefined;
}
