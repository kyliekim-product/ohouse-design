export function mergeTargetVariantHtml(variants, targetVariantId, html) {
  if (!targetVariantId || !html) return variants;
  let didUpdate = false;
  const next = variants.map((variant) => {
    if (variant.id !== targetVariantId) return variant;
    didUpdate = true;
    return { ...variant, html };
  });
  return didUpdate ? next : variants;
}
