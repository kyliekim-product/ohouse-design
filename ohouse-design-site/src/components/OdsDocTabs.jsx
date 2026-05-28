import * as RadixTabs from '@radix-ui/react-tabs';
import { renderToStaticMarkup } from 'react-dom/server';
import { DesignSystemProvider, Divider, Tab } from '@bucketplace/design-system';

const dividerMarkup = renderToStaticMarkup(
  <DesignSystemProvider>
    <Divider className="ods-doc-divider" height={1} />
  </DesignSystemProvider>,
);
const dividerStyle = dividerMarkup.match(/<style[\s\S]*?<\/style>/)?.[0] || '';
const dividerElement = dividerMarkup.replace(/<style[\s\S]*?<\/style>/, '');

function normalizeDocHtml(html) {
  const withoutMarkdownDividers = html.replace(/\s*<hr\b[^>]*>\s*/gi, '');
  return `${dividerStyle}${withoutMarkdownDividers.replace(
    /(<h2\b[^>]*>[\s\S]*?<\/h2>)/gi,
    `$1${dividerElement}`,
  )}`;
}

export default function OdsDocTabs({ guideHtml, specHtml }) {
  const tabs = [
    guideHtml ? { value: 'guide', label: 'Guide', html: normalizeDocHtml(guideHtml) } : null,
    specHtml ? { value: 'spec', label: 'Spec', html: normalizeDocHtml(specHtml) } : null,
  ].filter(Boolean);

  if (tabs.length === 0) return null;

  return (
    <DesignSystemProvider>
      <Tab defaultValue={tabs[0].value} className="ods-doc-tabs">
        <Tab.List mode="scrollable" className="ods-doc-tabs__list">
          {tabs.map((tab) => (
            <Tab.Item
              key={tab.value}
              value={tab.value}
              className="ods-doc-tabs__item"
              data-doc-tab-trigger={tab.value}
            >
              <Tab.ItemSlot side="center">
                <Tab.ItemLabel>{tab.label}</Tab.ItemLabel>
              </Tab.ItemSlot>
            </Tab.Item>
          ))}
        </Tab.List>
        <div className="ods-doc-tabs__body">
          <div className="ods-doc-tabs__content">
            {tabs.map((tab) => (
              <RadixTabs.Content
                key={tab.value}
                value={tab.value}
                className="ods-doc-tabs__panel"
                data-doc-tab-panel={tab.value}
                forceMount
              >
                <div className="prose" dangerouslySetInnerHTML={{ __html: tab.html }} />
              </RadixTabs.Content>
            ))}
          </div>
          <aside className="ods-doc-tabs__toc" aria-label="Table of contents">
            {tabs.map((tab) => (
              <nav
                key={tab.value}
                className="ods-doc-tabs__toc-nav"
                data-doc-tab-toc={tab.value}
                hidden
              />
            ))}
          </aside>
        </div>
      </Tab>
    </DesignSystemProvider>
  );
}
