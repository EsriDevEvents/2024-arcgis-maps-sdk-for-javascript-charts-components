import { useEffect, useRef, useState, useCallback } from 'react';
import { CalciteIcon, CalciteBlock, CalciteButton } from '@esri/calcite-components-react';
import { ArcgisChartsActionBar, ArcgisChartsBoxPlot, ArcgisChartsScatterPlot } from '@arcgis/charts-components-react';
import { ScatterPlotModel } from '@arcgis/charts-model';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import './Charts.css';

// Define the props for the Charts component
interface ChartsProps {
  mapElement: HTMLArcgisMapElement;
}

export default function Charts({ mapElement }: ChartsProps) {
  const boxPlotRef1 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const boxPlotRef2 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const scatterPlotRef = useRef<HTMLArcgisChartsScatterPlotElement>(null);

  // STEP 2: Create ref for the action bar
  const actionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);

  // STEP 3: Create state for the layer view, this will be used for the selection complete event
  const [layerView, setLayerView] = useState(null);

  // STEP 3a: Define the highlight select, set the typing to IHandle (a handle to a highlight call result, can be used to remove the highlight from the view) from arcgis core
  let selectionData: HTMLArcgisChartsBoxPlotElement['selectionData'];
  let highlightSelect: IHandle | undefined;

  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      const map = mapElement.map;

      // STEP 4: Get the view from the map element
      const view = mapElement.view;

      const aquiferSaturatedThicknessLayer = map.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      const waterDepthPercentageChangeLayer = map.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

      // STEP 5: Get the layer view for the waterDepthPercentageChangeLayer
      const layerView = await view.whenLayerView(waterDepthPercentageChangeLayer);

      // STEP 6: Set the layer view
      setLayerView(layerView);

      const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

      boxPlotRef1.current.config = boxPlotConfig1;
      boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef2.current.config = boxPlotConfig2;
      boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

      // Set the default actions for the box plot action bar
      setDefaultActionBar(actionBarRef.current, 'boxPlotSeries');

      // ================================================ Scatterplot (with Model) ===================================================
      const scatterPlotParams = {
        layer: aquiferSaturatedThicknessLayer,
        xAxisFieldName: 'YEAR1984',
        yAxisFieldName: 'YEAR2014',
      };

      const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);
      const config = await scatterPlotModel.config;

      scatterPlotRef.current.config = config;
      scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;
    }
  }, [mapElement]);

  // STEP 7: Create a function to handle the selection complete event
  const handleArcgisChartsSelectionComplete =
    (actionBarRef: React.RefObject<HTMLArcgisChartsActionBarElement>) => (event: CustomEvent<HTMLArcgisChartsBoxPlotElement['selectionData']>) => {
      if (event.detail?.selectionOIDs !== selectionData?.selectionOIDs) {
        // STEP 8: Get the selection data from the event
        selectionData = event.detail;

        // STEP 9: create a variable to check if the selectionOIDs are empty
        const emptySelection = (selectionData.selectionOIDs ?? [])?.length === 0;

        // STEP 10: Clear previous selections on the map
        highlightSelect?.remove();

        // STEP 11: If the there're no selection, clear the selectio on all the charts
        // If there are selection, highlight the selected features on the map component, then sync up selection between charts
        if (emptySelection) {
          boxPlotRef1.current.clearSelection();
          boxPlotRef2.current.clearSelection();
          scatterPlotRef.current.clearSelection();

          // Enable or disable the clear selection and filter by selection buttons based on the selection data
          actionBarRef.current.disableClearSelection = true;
          actionBarRef.current.disableFilterBySelection = true;
        } else {
          // Highlight the selected features on the map component
          highlightSelect = layerView.highlight(selectionData.selectionOIDs);

          // Sync up selection between charts
          boxPlotRef1.current.selectionData = selectionData;
          boxPlotRef2.current.selectionData = selectionData;
          scatterPlotRef.current.selectionData = selectionData;

          // Enable or disable the clear selection and filter by selection buttons based on the selection data
          actionBarRef.current.disableClearSelection = false;
          actionBarRef.current.disableFilterBySelection = false;
        }
      }
    };
  // ================================================ Save Charts ===================================================
  const saveCharts = async () => {
    if (mapElement !== null) {
      // STEP 1: Get the map from the map element
      const map = mapElement.map;

      // STEP 2: Get the aquiferSaturatedThicknessLayer from the webmap
      const aquiferSaturatedThicknessLayer = map.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;

      // STEP 3: Get the scatter plot config
      const scatterPlotConfig = scatterPlotRef.current.config;

      // STEP 4: Push the scatter plot config to the charts of the aquiferSaturatedThicknessLayer
      aquiferSaturatedThicknessLayer.charts = [];
      aquiferSaturatedThicknessLayer.charts.push(scatterPlotConfig);

      // STEP 5: Save the map
      await map.save();
    }
  };

  // Use effect to initialize the chart
  useEffect(() => {
    initializeChart().catch(console.error);
  }, [initializeChart]);

  return (
    <div data-panel-id='charts'>
      <CalciteButton kind='inverse' icon-start='save' class='calcite-mode-dark' onClick={saveCharts}>
        Save Charts
      </CalciteButton>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data since 1974'>
        {/* STEP 1: Add the action bar component inside the charts component, also add the eventListener */}
        <ArcgisChartsBoxPlot ref={boxPlotRef1} onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(actionBarRef)}>
          <ArcgisChartsActionBar slot='action-bar' ref={actionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data in 2024'>
        <ArcgisChartsBoxPlot ref={boxPlotRef2}></ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Depth of Water (1974 vs 2024) sized by Saturated Thickness'>
        <ArcgisChartsScatterPlot ref={scatterPlotRef}></ArcgisChartsScatterPlot>
        <CalciteIcon scale='s' slot='icon' icon='graph-scatter-plot'></CalciteIcon>
      </CalciteBlock>
    </div>
  );
}

// STEP 12: You can also customize the action bar by setting some default actions base on chart type.
// You can hide/show certain controls, or perform custom actions.
function setDefaultActionBar(actionBarElement: HTMLArcgisChartsActionBarElement, seriesType: string) {
  if (actionBarElement !== null) {
    actionBarElement.actionBarHideActionsProps = {
      hideRotateChart: seriesType === 'histogramSeries' || seriesType === 'pieSeries' || seriesType === 'scatterSeries',
      hideFilterByExtent: true,
      hideZoom: true,
      hideSelection: true,
      hideFullExtent: true,
    };
  }
}
