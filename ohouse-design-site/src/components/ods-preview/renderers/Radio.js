import React from 'react';
import { RadioGroup } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['defaultValue', 'disabled', 'name', 'required', 'size']);
const ITEM_KEYS = new Set(['align', 'disabled', 'label', 'value']);
const ALIGNS = new Set(['top', 'center']);
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
    errors.push(`preview.props.${key} is not supported by the Radio renderer`);
  }

  if (props.defaultValue !== undefined && typeof props.defaultValue !== 'string') {
    errors.push('Radio preview props.defaultValue must be a string when present');
  }

  if (props.name !== undefined && typeof props.name !== 'string') {
    errors.push('Radio preview props.name must be a string when present');
  }

  if (props.size !== undefined && (typeof props.size !== 'string' || !SIZES.has(props.size))) {
    errors.push('Radio preview props.size must match RadioSize');
  }

  for (const key of ['disabled', 'required']) {
    if (props[key] === undefined || typeof props[key] === 'boolean') continue;
    errors.push(`Radio preview props.${key} must be a boolean when present`);
  }

  if (!Array.isArray(preview.items) || preview.items.length === 0) {
    errors.push('Radio preview requires at least one item');
    return errors;
  }

  const itemValues = new Set();
  for (let index = 0; index < preview.items.length; index += 1) {
    const item = preview.items[index];

    for (const key of Object.keys(item)) {
      if (ITEM_KEYS.has(key)) continue;
      errors.push(`Radio preview items[${index}].${key} is not supported`);
    }

    if (typeof item.value !== 'string' || item.value.length === 0) {
      errors.push(`Radio preview items[${index}].value is required`);
    } else {
      itemValues.add(item.value);
    }

    if (typeof item.label !== 'string' || item.label.length === 0) {
      errors.push(`Radio preview items[${index}].label is required`);
    }

    if (item.align !== undefined && (typeof item.align !== 'string' || !ALIGNS.has(item.align))) {
      errors.push(`Radio preview items[${index}].align must match RadioItemAlign`);
    }

    if (item.disabled !== undefined && typeof item.disabled !== 'boolean') {
      errors.push(`Radio preview items[${index}].disabled must be a boolean when present`);
    }
  }

  if (props.defaultValue !== undefined && !itemValues.has(props.defaultValue)) {
    errors.push('Radio preview props.defaultValue must match one item value');
  }

  return errors;
}

function renderItem(item) {
  return React.createElement(
    RadioGroup.Radio,
    {
      key: item.value,
      align: item.align,
      disabled: item.disabled,
      value: item.value,
    },
    React.createElement(
      RadioGroup.Indicator,
      null,
      React.createElement(RadioGroup.IndicatorIcon, null),
    ),
    React.createElement(RadioGroup.Label, null, item.label),
  );
}

export function render(preview) {
  return React.createElement(
    'div',
    { className: 'ods-web-preview__options' },
    React.createElement(
      RadioGroup,
      pickProps(preview.props),
      ...preview.items.map(renderItem),
    ),
  );
}

export default {
  name: 'Radio',
  render,
  validate,
};
