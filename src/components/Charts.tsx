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
  // const actionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);

  // STEP 3: Create state for the layer view, this will be used for the selection complete event
  // const [layerView, setLayerView] = useState(null);

  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      const map = mapElement.map;

      // STEP 4: Get the view from the map element
      // const view = mapElement.view;

      const aquiferSaturatedThicknessLayer = map.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      const waterDepthPercentageChangeLayer = map.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

      // STEP 5: Get the layer view for the waterDepthPercentageChangeLayer
      // const layerView = await view.whenLayerView(waterDepthPercentageChangeLayer);

      // STEP 6: Set the layer view
      // setLayerView(layerView);

      const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

      boxPlotRef1.current.config = boxPlotConfig1;
      boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef2.current.config = boxPlotConfig2;
      boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

      // Set the default actions for the box plot action bar
      // setDefaultActionBar(actionBarRef.current, 'boxPlotSeries');

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
  const handleArcgisChartsSelectionComplete = (actionBarRef: React.RefObject<HTMLArcgisChartsActionBarElement>) => (event: CustomEvent) => {
    // STEP 8: Define the highlight select, set the typing to IHandle (a handle to a highlight call result, can be used to remove the highlight from the view) from arcgis core
    // let highlightSelect: IHandle | undefined;
    //
    // STEP 9: Get the selection OIDs from the event detail
    // const selectionOIDs = event.detail.selectionOIDs;
    //
    // STEP 10: Remove the previous highlight select and set the new one
    // highlightSelect?.remove();
    // highlightSelect = layerView.highlight(selectionOIDs);
    //
    // STEP 11: Enable or disable the clear selection and filter by selection buttons based on the selection data
    // if (selectionOIDs === undefined || selectionOIDs.length === 0) {
    //   actionBarRef.current.disableClearSelection = true;
    //   actionBarRef.current.disableFilterBySelection = true;
    // } else {
    //   actionBarRef.current.disableClearSelection = false;
    //   actionBarRef.current.disableFilterBySelection = false;
    // }
  };

  // Function to save the charts
  const saveCharts = async () => {
    if (mapElement !== null) {
      // STEP 1: Get the map from the map element
      // const map = mapElement.map;
      //
      // STEP 2: Get the aquiferSaturatedThicknessLayer from the webmap
      // const aquiferSaturatedThicknessLayer = map.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      //
      // STEP 3: Get the scatter plot config
      // const scatterPlotConfig = scatterPlotRef.current.config;
      //
      // STEP 4: Push the scatter plot config to the charts of the aquiferSaturatedThicknessLayer
      // aquiferSaturatedThicknessLayer.charts = [];
      // aquiferSaturatedThicknessLayer.charts.push(scatterPlotConfig);
      //
      // STEP 5: Save the map
      // await map.save();
    }
  };

  // Use effect to initialize the chart
  useEffect(() => {
    initializeChart().catch(console.error);
  }, [initializeChart]);

  return (
    <div data-panel-id='charts'>
      {/* <CalciteButton kind='inverse' icon-start='save' class='calcite-mode-dark' onClick={saveCharts}>
        Save Charts
      </CalciteButton> */}
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data since 1974'>
        {/* STEP 1: Add the action bar component inside the charts component */}
        {/* <ArcgisChartsBoxPlot ref={boxPlotRef1} onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(actionBarRef)}> */}
        <ArcgisChartsBoxPlot ref={boxPlotRef1}>
          {/* <ArcgisChartsActionBar slot='action-bar' ref={actionBarRef}></ArcgisChartsActionBar> */}
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
