import React from 'react';
import { Chip } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['disabled', 'size', 'variant']);
const SIZES = new Set(['sm', 'md']);
const VARIANTS = new Set(['normal', 'outlined', 'solid', 'subtle']);
const SLOT_SIDES = ['left', 'center', 'right'];

function pickProps(props) {
  if (!props || typeof props !== 'object') return {};
  return Object.fromEntries(
    Object.entries(props).filter(([key, value]) => PROP_KEYS.has(key) && value !== undefined && value !== null),
  );
}

export function validate(preview) {
  const errors = [];
  const props = preview.props || {};

  for (const key of Object.keys(props)) {
    if (PROP_KEYS.has(key)) continue;
    errors.push(`preview.props.${key} is not supported by the Chip renderer`);
  }

  if (typeof props.size !== 'string' || !SIZES.has(props.size)) {
    errors.push('Chip preview requires props.size to match ChipSize');
  }

  if (typeof props.variant !== 'string' || !VARIANTS.has(props.variant)) {
    errors.push('Chip preview requires props.variant to match ChipVariant');
  }

  if (props.disabled !== undefined && typeof props.disabled !== 'boolean') {
    errors.push('Chip preview props.disabled must be a boolean when present');
  }

  for (const [slotName, slotValue] of Object.entries(preview.slots || {})) {
    if (!SLOT_SIDES.includes(slotName)) {
      errors.push(`Chip preview slot "${slotName}" must match ChipSlotSide`);
    }

    if (slotValue.label !== undefined && typeof slotValue.label !== 'string') {
      errors.push(`Chip preview slots.${slotName}.label must be a string when present`);
    }
  }

  return errors;
}

function renderSlot(side, slot) {
  if (!slot?.label) return null;

  return React.createElement(
    Chip.Slot,
    { key: side, side },
    React.createElement(Chip.Label, null, slot.label),
  );
}

export function render(preview) {
  const slots = preview.slots || {};

  return React.createElement(
    'div',
    { className: 'ods-web-preview__center' },
    React.createElement(
      Chip,
      pickProps(preview.props),
      ...SLOT_SIDES.map((side) => renderSlot(side, slots[side])).filter(Boolean),
    ),
  );
}

export default {
  name: 'Chip',
  render,
  validate,
};
