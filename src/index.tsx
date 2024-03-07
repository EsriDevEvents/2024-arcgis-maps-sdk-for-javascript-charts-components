import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Charts from './components/Charts';
import {
  CalciteShellPanel,
  CalciteIcon,
  CalcitePanel,
  CalciteShell,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteChipGroup,
  CalciteChip,
  CalciteBlock,
} from '@esri/calcite-components-react';
import { ArcgisMap, ArcgisHome } from '@arcgis/map-components-react';

import { defineCustomElements as defineCalciteElements } from '@esri/calcite-components/dist/loader';
import { defineCustomElements as defineChartsElements } from '@arcgis/charts-components/dist/loader';
import { defineCustomElements as defineMapElements } from '@arcgis/map-components/dist/loader';

import './style.css';

// define custom elements in the browser, and load the assets from the CDN
defineChartsElements(window, { resourcesUrl: 'https://js.arcgis.com/charts-components/4.29/t9n' });
defineCalciteElements(window, { resourcesUrl: 'https://js.arcgis.com/calcite-components/2.4.0/assets' });
defineMapElements(window, { resourcesUrl: 'https://js.arcgis.com/map-components/4.29/assets' });

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [element, setElement] = useState(null);

  return (
    <React.StrictMode>
      <CalciteShell id='shell' content-behind>
        <CalcitePanel>
          <ArcgisMap
            id='mapEl'
            item-id='57919ac3b4a04a00b7d150d679eb866a'
            onArcgisViewReadyChange={(e) => {
              setElement(e.target);
            }}
          >
            <ArcgisHome position='top-right'></ArcgisHome>
          </ArcgisMap>
        </CalcitePanel>

        <CalciteShellPanel slot='panel-start' display-mode='float'>
          <CalciteNavigation class='calcite-mode-dark'>
            <CalciteNavigationLogo id='nav-logo' slot='logo' description='Esri Developer Summit 2024'></CalciteNavigationLogo>
            <CalciteNavigation slot='navigation-secondary' class='calcite-mode-light'>
              <div slot='content-end' className='content-end-container'>
                <CalciteChipGroup label='Map layers' selection-mode='multiple' id='chip-group'>
                  <CalciteChip value='1' selected>
                    Aquifer
                  </CalciteChip>
                  <CalciteChip value='2' selected>
                    Wells
                  </CalciteChip>
                </CalciteChipGroup>
              </div>
            </CalciteNavigation>
          </CalciteNavigation>

          <CalcitePanel>
            <Charts mapElement={element} />
          </CalcitePanel>
        </CalciteShellPanel>
      </CalciteShell>
    </React.StrictMode>
  );
}
root.render(<App />);
