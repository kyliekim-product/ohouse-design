import React from 'react';
import { Spinner } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['size', 'color']);
const COLORS = new Set([
  'foreground',
  'foregroundWeak',
  'foregroundDisabled',
  'foregroundInverse',
  'foregroundOnSolid',
  'foregroundBrand',
  'foregroundEmphasis',
  'foregroundCritical',
  'foregroundAttention',
]);

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
    errors.push(`preview.props.${key} is not supported by the Spinner renderer`);
  }

  if (props.size !== undefined && (typeof props.size !== 'number' || props.size <= 0)) {
    errors.push('Spinner preview props.size must be a positive number when present');
  }

  if (props.color !== undefined && (typeof props.color !== 'string' || !COLORS.has(props.color))) {
    errors.push('Spinner preview props.color must match a supported DS color token');
  }

  return errors;
}

export function render(preview) {
  return React.createElement(
    'div',
    { className: 'ods-web-preview__center' },
    React.createElement(Spinner, pickProps(preview.props)),
  );
}

export default {
  name: 'Spinner',
  render,
  validate,
};
