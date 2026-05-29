import React from 'react';
import { Checkbox } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['align', 'checked', 'disabled', 'required', 'size']);
const ALIGNS = new Set(['top', 'center']);
const CHECKED_VALUES = new Set([true, false, 'indeterminate']);
const SIZES = new Set(['medium', 'small']);

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
    errors.push(`preview.props.${key} is not supported by the Checkbox renderer`);
  }

  if (props.align !== undefined && (typeof props.align !== 'string' || !ALIGNS.has(props.align))) {
    errors.push('Checkbox preview props.align must match CheckboxAlign');
  }

  if (props.checked !== undefined && !CHECKED_VALUES.has(props.checked)) {
    errors.push('Checkbox preview props.checked must be boolean or "indeterminate"');
  }

  if (props.size !== undefined && (typeof props.size !== 'string' || !SIZES.has(props.size))) {
    errors.push('Checkbox preview props.size must match CheckboxSize');
  }

  for (const key of ['disabled', 'required']) {
    if (props[key] === undefined || typeof props[key] === 'boolean') continue;
    errors.push(`Checkbox preview props.${key} must be a boolean when present`);
  }

  const label = preview.slots?.center?.label;
  if (label !== undefined && typeof label !== 'string') {
    errors.push('Checkbox preview slots.center.label must be a string when present');
  }

  return errors;
}

export function render(preview) {
  const label = preview.slots?.center?.label || 'Checkbox';

  return React.createElement(
    'div',
    { className: 'ods-web-preview__center' },
    React.createElement(
      Checkbox,
      pickProps(preview.props),
      React.createElement(
        Checkbox.Indicator,
        null,
        React.createElement(Checkbox.IndicatorIcon, null),
      ),
      React.createElement(Checkbox.Label, null, label),
    ),
  );
}

export default {
  name: 'Checkbox',
  render,
  validate,
};
