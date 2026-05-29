import { OdsWebPreview as PackageOdsWebPreview } from '@bucketplace/ods-web-preview';

export default function OdsWebPreview({ slug, preview }) {
  return <PackageOdsWebPreview slug={slug} preview={preview} />;
}
