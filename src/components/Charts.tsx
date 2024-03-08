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
  // Create refs for the box plots and scatter plot
  const boxPlotRef1 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const boxPlotRef2 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const scatterPlotRef = useRef<HTMLArcgisChartsScatterPlotElement>(null);

  // Create refs for the action bars
  const boxPlotActionBarRef1 = useRef<HTMLArcgisChartsActionBarElement>(null);
  const boxPlotActionBarRef2 = useRef<HTMLArcgisChartsActionBarElement>(null);
  const scatterPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);

  // Create state for the layer view
  const [layerView, setLayerView] = useState(null);

  // Define the highlight select
  let highlightSelect: IHandle | undefined;

  // useState on selectionData, so the it can be used to pass selectionData between charts
  const [selectionData, setSelectionData] = useState(null);

  // Function to save the charts
  const saveCharts = async () => {
    if (mapElement !== null) {
      // Get the webmap from the map element
      const webmap = mapElement.map;
      // Get the aquiferSaturatedThicknessLayer from the webmap
      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;

      // Get the scatter plot config
      const scatterPlotConfig = scatterPlotRef.current.config;

      // Push the scatter plot config to the charts of the aquiferSaturatedThicknessLayer
      aquiferSaturatedThicknessLayer.charts.push(scatterPlotConfig);

      // Save the webmap
      await webmap.save();
    }
  };

  // Function to initialize the chart
  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      // Get the webmap and view from the map element
      const webmap = mapElement.map;
      const view = mapElement.view;

      // Get the aquiferSaturatedThicknessLayer and waterDepthPercentageChangeLayer from the webmap
      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      const waterDepthPercentageChangeLayer = webmap.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

      // Get the layer view for the waterDepthPercentageChangeLayer
      const layerView = await view.whenLayerView(waterDepthPercentageChangeLayer);

      // Set the layer view
      setLayerView(layerView);

      // Get the box plot configs from the waterDepthPercentageChangeLayer
      const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

      // Set the configs and layer for the box plots
      boxPlotRef1.current.config = boxPlotConfig1;
      boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef2.current.config = boxPlotConfig2;
      boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

      // Set the default actions for the box plot action bar
      setDefaultActionBar(boxPlotActionBarRef1.current, 'boxPlotSeries');
      setDefaultActionBar(boxPlotActionBarRef2.current, 'boxPlotSeries');

      // Define the scatter plot params
      const scatterPlotParams = {
        layer: aquiferSaturatedThicknessLayer,
        xAxisFieldName: 'YEAR1974',
        yAxisFieldName: 'YEAR2014',
      };

      // Create a new scatter plot model with the scatter plot params
      const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);

      // Get the config from the scatter plot model
      const config = await scatterPlotModel.config;

      // Set the config and layer for the scatter plot
      scatterPlotRef.current.config = config;
      scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;

      // Set the default actions for the scatter plot action bar
      setDefaultActionBar(scatterPlotActionBarRef.current, 'scatterSeries');
    }
  }, [mapElement]);

  // Function to handle the selection complete event
  const handleArcgisChartsSelectionComplete =
    (actionBarRef: React.RefObject<HTMLArcgisChartsActionBarElement>) => (event: CustomEvent<HTMLArcgisChartsBarChartElement['selectionData']>) => {
      // Get the selection data from the event detail which is of type HTMLArcgisChartsBarChartElement["selectionData"]
      const selectionOIDs = event.detail.selectionOIDs;

      setSelectionData({ selectionOIDs });

      // Remove the previous highlight select and set the new one
      highlightSelect?.remove();
      highlightSelect = layerView.highlight(selectionOIDs);

      // Enable or disable the clear selection and filter by selection buttons based on the selection data
      if (selectionOIDs === undefined || selectionOIDs.length === 0) {
        actionBarRef.current.disableClearSelection = true;
        actionBarRef.current.disableFilterBySelection = true;
      } else {
        actionBarRef.current.disableClearSelection = false;
        actionBarRef.current.disableFilterBySelection = false;
      }
    };

  // Use effect to initialize the chart
  useEffect(() => {
    initializeChart().catch(console.error);
  }, [initializeChart]);

  // Render the component
  return (
    <div data-panel-id='charts'>
      <CalciteButton kind='inverse' icon-start='save' class='calcite-mode-dark' onClick={saveCharts}>
        Save Charts
      </CalciteButton>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data since 1974'>
        <ArcgisChartsBoxPlot
          ref={boxPlotRef1}
          selectionData={selectionData}
          onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(boxPlotActionBarRef1)}
        >
          <ArcgisChartsActionBar slot='action-bar' ref={boxPlotActionBarRef1}></ArcgisChartsActionBar>
        </ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data in 2024'>
        <ArcgisChartsBoxPlot
          ref={boxPlotRef2}
          selectionData={selectionData}
          onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(boxPlotActionBarRef2)}
        >
          <ArcgisChartsActionBar slot='action-bar' ref={boxPlotActionBarRef2}></ArcgisChartsActionBar>
        </ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Depth of Water (1974 vs 2024) sized by Saturated Thickness'>
        <ArcgisChartsScatterPlot
          ref={scatterPlotRef}
          selectionData={selectionData}
          onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(scatterPlotActionBarRef)}
        >
          <ArcgisChartsActionBar slot='action-bar' ref={scatterPlotActionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsScatterPlot>
        <CalciteIcon scale='s' slot='icon' icon='graph-scatter-plot'></CalciteIcon>
      </CalciteBlock>
    </div>
  );
}

// Function to set the default actions for an action bar
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
