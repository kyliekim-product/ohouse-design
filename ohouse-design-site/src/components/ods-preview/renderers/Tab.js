import React from 'react';
import { Tab } from '@bucketplace/design-system';

const PROP_KEYS = new Set(['defaultValue', 'mode', 'paddingX', 'value']);
const ITEM_KEYS = new Set(['disabled', 'dot', 'label', 'value']);
const MODES = new Set(['fixed', 'scrollable']);

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
    errors.push(`preview.props.${key} is not supported by the Tab renderer`);
  }

  for (const key of ['defaultValue', 'value']) {
    if (props[key] === undefined || typeof props[key] === 'string') continue;
    errors.push(`Tab preview props.${key} must be a string when present`);
  }

  if (props.mode !== undefined && (typeof props.mode !== 'string' || !MODES.has(props.mode))) {
    errors.push('Tab preview props.mode must match TabListMode');
  }

  if (props.paddingX !== undefined && (typeof props.paddingX !== 'number' || props.paddingX < 0)) {
    errors.push('Tab preview props.paddingX must be a non-negative number when present');
  }

  if (!Array.isArray(preview.items) || preview.items.length === 0) {
    errors.push('Tab preview requires at least one item');
    return errors;
  }

  const itemValues = new Set();
  for (let index = 0; index < preview.items.length; index += 1) {
    const item = preview.items[index];

    for (const key of Object.keys(item)) {
      if (ITEM_KEYS.has(key)) continue;
      errors.push(`Tab preview items[${index}].${key} is not supported`);
    }

    if (typeof item.value !== 'string' || item.value.length === 0) {
      errors.push(`Tab preview items[${index}].value is required`);
    } else {
      itemValues.add(item.value);
    }

    if (typeof item.label !== 'string' || item.label.length === 0) {
      errors.push(`Tab preview items[${index}].label is required`);
    }

    for (const key of ['disabled', 'dot']) {
      if (item[key] === undefined || typeof item[key] === 'boolean') continue;
      errors.push(`Tab preview items[${index}].${key} must be a boolean when present`);
    }
  }

  for (const key of ['defaultValue', 'value']) {
    if (props[key] !== undefined && !itemValues.has(props[key])) {
      errors.push(`Tab preview props.${key} must match one item value`);
    }
  }

  return errors;
}

function renderItem(item) {
  return React.createElement(
    Tab.Item,
    {
      key: item.value,
      disabled: item.disabled,
      dot: item.dot,
      value: item.value,
    },
    React.createElement(
      Tab.ItemSlot,
      { side: 'center' },
      React.createElement(Tab.ItemLabel, null, item.label),
    ),
  );
}

export function render(preview) {
  const props = pickProps(preview.props);
  const { mode, paddingX, ...rootProps } = props;

  return React.createElement(
    'div',
    { className: 'ods-web-preview__tabs' },
    React.createElement(
      Tab,
      rootProps,
      React.createElement(
        Tab.List,
        { mode, paddingX },
        ...preview.items.map(renderItem),
      ),
    ),
  );
}

export default {
  name: 'Tab',
  render,
  validate,
};
