import Webmap from '@arcgis/core/Webmap';

/**
 * Simple data loader against public data.
 * For the test data, we need a feature layer.
 */
export async function loadWebmap() {
  const webmap = new Webmap({
    portalItem: {
      id: '004fcc67ef7f45a1816714e379bc279b',
    },
  });
  await webmap.loadAll();

  return webmap;
}
