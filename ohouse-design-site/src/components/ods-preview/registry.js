import BoxButton from './renderers/BoxButton.js';
import ScrapButton from './renderers/ScrapButton.js';
import Spinner from './renderers/Spinner.js';
import Switch from './renderers/Switch.js';
import Thumbnail from './renderers/Thumbnail.js';

export const previewRenderers = {
  [BoxButton.name]: BoxButton,
  [ScrapButton.name]: ScrapButton,
  [Spinner.name]: Spinner,
  [Switch.name]: Switch,
  [Thumbnail.name]: Thumbnail,
};
