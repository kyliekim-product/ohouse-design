import React from 'react';
import { Thumbnail } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['src', 'ratio', 'radius', 'alt', 'quality', 'objectFit']);
const RADII = new Set(['medium', 'small', 'extraSmall', 'none']);
const OBJECT_FITS = new Set(['cover', 'contain', 'fill', 'none', 'scale-down']);
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 240%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop stop-color=%22%23eaf8f9%22/%3E%3Cstop offset=%221%22 stop-color=%22%23d8ecff%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22320%22 height=%22240%22 fill=%22url(%23g)%22/%3E%3Ccircle cx=%22240%22 cy=%2278%22 r=%2232%22 fill=%22%23ffffff%22 fill-opacity=%22.72%22/%3E%3Cpath d=%22M0 204 82 126l56 48 42-36 140 112H0z%22 fill=%22%2300a8ba%22 fill-opacity=%22.55%22/%3E%3C/svg%3E';

function pickProps(props) {
  if (!props || typeof props !== 'object') return {};
  return Object.fromEntries(
    Object.entries(props)
      .filter(([key, value]) => PROP_KEYS.has(key) && value !== undefined && value !== null)
      .map(([key, value]) => [key, key === 'src' && value === '__ods_placeholder_image__' ? PLACEHOLDER_IMAGE : value]),
  );
}

export function validate(preview) {
  const errors = [];
  const props = preview.props || {};

  for (const key of Object.keys(props)) {
    if (PROP_KEYS.has(key)) continue;
    errors.push(`preview.props.${key} is not supported by the Thumbnail renderer`);
  }

  if (typeof props.src !== 'string' || props.src.length === 0) {
    errors.push('Thumbnail preview requires props.src');
  }

  if (props.ratio !== undefined && (typeof props.ratio !== 'number' || props.ratio <= 0)) {
    errors.push('Thumbnail preview props.ratio must be a positive number when present');
  }

  if (props.radius !== undefined && (typeof props.radius !== 'string' || !RADII.has(props.radius))) {
    errors.push('Thumbnail preview props.radius must match Thumbnail radius');
  }

  if (props.alt !== undefined && typeof props.alt !== 'string') {
    errors.push('Thumbnail preview props.alt must be a string when present');
  }

  if (props.objectFit !== undefined && (typeof props.objectFit !== 'string' || !OBJECT_FITS.has(props.objectFit))) {
    errors.push('Thumbnail preview props.objectFit must match CSS object-fit');
  }

  return errors;
}

export function render(preview) {
  return React.createElement(
    'div',
    { className: 'ods-web-preview__thumbnail' },
    React.createElement(Thumbnail, pickProps(preview.props)),
  );
}

export default {
  name: 'Thumbnail',
  render,
  validate,
};
