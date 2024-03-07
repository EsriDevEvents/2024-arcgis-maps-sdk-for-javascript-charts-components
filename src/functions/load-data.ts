import Webmap from '@arcgis/core/Webmap';

/**
 * Simple data loader against public data.
 * For the test data, we need a feature layer.
 */
export async function loadWebmap() {
  const webmap = new Webmap({
    portalItem: {
      id: '57919ac3b4a04a00b7d150d679eb866a',
    },
  });
  await webmap.loadAll();

  return webmap;
}
