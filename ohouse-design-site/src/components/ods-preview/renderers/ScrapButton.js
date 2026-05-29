import React from 'react';
import { ScrapButton } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['variant', 'selected', 'disabled']);
const VARIANTS = new Set(['normal', 'media']);

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
    errors.push(`preview.props.${key} is not supported by the ScrapButton renderer`);
  }

  if (props.variant !== undefined && (typeof props.variant !== 'string' || !VARIANTS.has(props.variant))) {
    errors.push('ScrapButton preview props.variant must match ScrapButton variant');
  }

  for (const key of ['selected', 'disabled']) {
    if (props[key] === undefined || typeof props[key] === 'boolean') continue;
    errors.push(`ScrapButton preview props.${key} must be a boolean when present`);
  }

  return errors;
}

export function render(preview) {
  return React.createElement(
    'div',
    { className: 'ods-web-preview__center' },
    React.createElement(ScrapButton, pickProps(preview.props)),
  );
}

export default {
  name: 'ScrapButton',
  render,
  validate,
};
