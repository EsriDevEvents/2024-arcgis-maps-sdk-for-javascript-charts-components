import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Charts from './components/Charts';
import { CalciteShellPanel, CalcitePanel, CalciteShell, CalciteNavigation, CalciteNavigationLogo } from '@esri/calcite-components-react';
import { ArcgisMap, ArcgisHome } from '@arcgis/map-components-react';

import './style.css';

import { defineCustomElements as defineCalciteElements } from '@esri/calcite-components/dist/loader';
import { defineCustomElements as defineMapElements } from '@arcgis/map-components/dist/loader';

defineCalciteElements(window, { resourcesUrl: 'https://js.arcgis.com/calcite-components/2.4.0/assets' });
defineMapElements(window, { resourcesUrl: 'https://js.arcgis.com/map-components/4.29/assets' });

// STEP 1: Import the defineCustomElements function from the charts-components package
// import { defineCustomElements as defineChartsElements } from '@arcgis/charts-components/dist/loader';

// STEP 2: Define the charts elements in the browser, and load the necessary assets from the CDN
// defineChartsElements(window, { resourcesUrl: 'https://js.arcgis.com/charts-components/4.29/t9n' });

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [mapElement, setMapElement] = useState<HTMLArcgisMapElement>(null);

  return (
    <React.StrictMode>
      <CalciteShell id='shell' content-behind>
        <CalcitePanel>
          <ArcgisMap
            id='mapEl'
            item-id='57919ac3b4a04a00b7d150d679eb866a'
            onArcgisViewReadyChange={(event) => {
              setMapElement(event.target);
            }}
          >
            <ArcgisHome position='top-right'></ArcgisHome>
          </ArcgisMap>
        </CalcitePanel>

        <CalciteShellPanel slot='panel-start' display-mode='float'>
          <CalciteNavigation class='calcite-mode-dark'>
            <CalciteNavigationLogo
              id='nav-logo'
              slot='logo'
              description='Building Apps with ArcGIS Maps SDK for JavaScript Charts Components'
            ></CalciteNavigationLogo>
          </CalciteNavigation>

          <CalcitePanel>
            {/* STEP 3: Include the custom Charts react element with the mapElement prop */}
            {/* <Charts mapElement={mapElement} /> */}
          </CalcitePanel>
        </CalciteShellPanel>
      </CalciteShell>
    </React.StrictMode>
  );
}
root.render(<App />);
