import { BottomSheet, Dialog, Tooltip } from '@bucketplace/design-system';
import type { ComponentProps } from 'react';
import { usePrototypeOverlayContainer } from './usePrototypeOverlayContainer';

const DialogRoot = Dialog.Root;
const DialogPortal = Dialog.Portal;
const BottomSheetRoot = BottomSheet.Root;
const BottomSheetPortal = BottomSheet.Portal;
const TooltipRoot = Tooltip.Root;
const TooltipPortal = Tooltip.Portal;

type PrototypeDialogPortalProps = Omit<
  ComponentProps<typeof DialogPortal>,
  'container'
>;

function PrototypeDialogRoot(
  props: ComponentProps<typeof DialogRoot>,
): JSX.Element {
  return <DialogRoot {...props} />;
}

function PrototypeDialogPortal({
  children,
  ...props
}: PrototypeDialogPortalProps): JSX.Element | null {
  const container = usePrototypeOverlayContainer();
  if (!container) return null;
  return (
    <DialogPortal container={container} {...props}>
      {children}
    </DialogPortal>
  );
}

export const PrototypeDialog = Object.assign(PrototypeDialogRoot, {
  Root: PrototypeDialogRoot,
  Portal: PrototypeDialogPortal,
  Overlay: Dialog.Overlay,
  Header: Dialog.Header,
  Content: Dialog.Content,
  Title: Dialog.Title,
  Body: Dialog.Body,
  Description: Dialog.Description,
  Footer: Dialog.Footer,
  Close: Dialog.Close,
});

type PrototypeBottomSheetPortalProps = Omit<
  ComponentProps<typeof BottomSheetPortal>,
  'container'
>;

function PrototypeBottomSheetRoot(
  props: ComponentProps<typeof BottomSheetRoot>,
): JSX.Element {
  return <BottomSheetRoot {...props} />;
}

function PrototypeBottomSheetPortal({
  children,
  ...props
}: PrototypeBottomSheetPortalProps): JSX.Element | null {
  const container = usePrototypeOverlayContainer();
  if (!container) return null;
  return (
    <BottomSheetPortal container={container} {...props}>
      {children}
    </BottomSheetPortal>
  );
}

export const PrototypeBottomSheet = Object.assign(PrototypeBottomSheetRoot, {
  Root: PrototypeBottomSheetRoot,
  Portal: PrototypeBottomSheetPortal,
  Overlay: BottomSheet.Overlay,
  Trigger: BottomSheet.Trigger,
  Close: BottomSheet.Close,
  Content: BottomSheet.Content,
  Header: BottomSheet.Header,
  Body: BottomSheet.Body,
  Footer: BottomSheet.Footer,
  Grabber: BottomSheet.Grabber,
  Title: BottomSheet.Title,
  Description: BottomSheet.Description,
});

type PrototypeTooltipPortalProps = Omit<
  ComponentProps<typeof TooltipPortal>,
  'container'
>;

function PrototypeTooltipRoot(
  props: ComponentProps<typeof TooltipRoot>,
): JSX.Element {
  return <TooltipRoot {...props} />;
}

function PrototypeTooltipPortal({
  children,
  ...props
}: PrototypeTooltipPortalProps): JSX.Element | null {
  const container = usePrototypeOverlayContainer();
  if (!container) return null;
  return (
    <TooltipPortal container={container} {...props}>
      {children}
    </TooltipPortal>
  );
}

export const PrototypeTooltip = Object.assign(PrototypeTooltipRoot, {
  Root: PrototypeTooltipRoot,
  Trigger: Tooltip.Trigger,
  Portal: PrototypeTooltipPortal,
  Content: Tooltip.Content,
  IconSlot: Tooltip.IconSlot,
  Arrow: Tooltip.Arrow,
  Close: Tooltip.Close,
  SimpleTooltip: Tooltip.SimpleTooltip,
  SimpleTooltipText: Tooltip.SimpleTooltipText,
  ContentTooltip: Tooltip.ContentTooltip,
});
