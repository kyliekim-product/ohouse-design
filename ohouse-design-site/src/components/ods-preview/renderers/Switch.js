import React from 'react';
import { Switch } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['size', 'checked', 'disabled']);
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
    errors.push(`preview.props.${key} is not supported by the Switch renderer`);
  }

  if (props.size !== undefined && (typeof props.size !== 'string' || !SIZES.has(props.size))) {
    errors.push('Switch preview props.size must match SwitchSize');
  }

  for (const key of ['checked', 'disabled']) {
    if (props[key] === undefined || typeof props[key] === 'boolean') continue;
    errors.push(`Switch preview props.${key} must be a boolean when present`);
  }

  return errors;
}

export function render(preview) {
  return React.createElement(
    'div',
    { className: 'ods-web-preview__center' },
    React.createElement(Switch, pickProps(preview.props)),
  );
}

export default {
  name: 'Switch',
  render,
  validate,
};
