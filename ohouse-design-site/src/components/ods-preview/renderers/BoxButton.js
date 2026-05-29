import React from 'react';
import { BoxButton } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['size', 'variant', 'disabled', 'loading']);
const SIZES = new Set(['extra-large', 'large', 'medium', 'small', 'extra-small']);
const VARIANTS = new Set(['normal', 'subtle', 'solid', 'outlined', 'brand-solid', 'brand-outlined']);
const SLOT_SIDES = new Set(['left', 'center', 'right']);

function pickProps(props, allowedKeys) {
  if (!props || typeof props !== 'object') return {};
  return Object.fromEntries(
    Object.entries(props).filter(([key, value]) => allowedKeys.has(key) && value !== undefined && value !== null),
  );
}

export function validate(preview) {
  const errors = [];
  const props = preview.props || {};

  for (const key of Object.keys(props)) {
    if (PROP_KEYS.has(key)) continue;
    errors.push(`preview.props.${key} is not supported by the BoxButton renderer`);
  }

  if (typeof props.size !== 'string' || !SIZES.has(props.size)) {
    errors.push('BoxButton preview requires props.size to match BoxButtonSize');
  }

  if (typeof props.variant !== 'string' || !VARIANTS.has(props.variant)) {
    errors.push('BoxButton preview requires props.variant to match BoxButtonVariant');
  }

  for (const key of ['disabled', 'loading']) {
    if (props[key] === undefined || typeof props[key] === 'boolean') continue;
    errors.push(`BoxButton preview props.${key} must be a boolean when present`);
  }

  const slots = preview.slots || {};
  for (const [slotName, slotValue] of Object.entries(slots)) {
    if (!SLOT_SIDES.has(slotName)) {
      errors.push(`BoxButton preview slot "${slotName}" must match BoxButtonSlotSide`);
    }

    if (slotValue.label !== undefined && typeof slotValue.label !== 'string') {
      errors.push(`BoxButton preview slots.${slotName}.label must be a string when present`);
    }
  }

  return errors;
}

export function render(preview) {
  const props = pickProps(preview.props, PROP_KEYS);
  const label = preview.slots?.center?.label || 'Button';

  return React.createElement(
    'div',
    { className: 'ods-web-preview__buttons' },
    React.createElement(
      BoxButton,
      props,
      React.createElement(
        BoxButton.Slot,
        { side: 'center' },
        React.createElement(BoxButton.Label, null, label),
      ),
    ),
  );
}

export default {
  name: 'BoxButton',
  render,
  validate,
};
