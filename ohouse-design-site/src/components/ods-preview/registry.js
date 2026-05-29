import BoxButton from './renderers/BoxButton.js';
import Checkbox from './renderers/Checkbox.js';
import Chip from './renderers/Chip.js';
import Radio from './renderers/Radio.js';
import ScrapButton from './renderers/ScrapButton.js';
import Spinner from './renderers/Spinner.js';
import Switch from './renderers/Switch.js';
import Tab from './renderers/Tab.js';
import Thumbnail from './renderers/Thumbnail.js';

export const previewRenderers = {
  [BoxButton.name]: BoxButton,
  [Checkbox.name]: Checkbox,
  [Chip.name]: Chip,
  [Radio.name]: Radio,
  [ScrapButton.name]: ScrapButton,
  [Spinner.name]: Spinner,
  [Switch.name]: Switch,
  [Tab.name]: Tab,
  [Thumbnail.name]: Thumbnail,
};
