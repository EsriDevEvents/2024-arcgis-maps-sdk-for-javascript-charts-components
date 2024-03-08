import { useEffect, useRef, useState, useCallback } from 'react';
import { CalciteIcon, CalciteBlock, CalciteButton } from '@esri/calcite-components-react';

import { ArcgisChartsActionBar, ArcgisChartsBoxPlot, ArcgisChartsScatterPlot } from '@arcgis/charts-components-react';
import { ScatterPlotModel } from '@arcgis/charts-model';

import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import './Charts.css';

// set the default action bar based on the series type
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

interface ChartsProps {
  mapElement: HTMLArcgisMapElement;
}
export default function Charts({ mapElement }: ChartsProps) {
  // useRef on the charts components
  const boxPlotRef1 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const boxPlotRef2 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const scatterPlotRef = useRef<HTMLArcgisChartsScatterPlotElement>(null);

  const boxPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);
  const scatterPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);

  // useState on layerView, so the selection eventListener can use it
  const [layerView, setLayerView] = useState(null);

  let highlightSelect: IHandle | undefined;

  // function to save the chart configurations to the webmap
  const saveCharts = async () => {
    if (mapElement !== null) {
      const webmap = await mapElement.map;
      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;

      // save the scatter plot configuration on the feature layer in the webmap
      const scatterPlotConfig = scatterPlotRef.current.config;
      aquiferSaturatedThicknessLayer.charts.push(scatterPlotConfig);

      await webmap.save();
    }
  };

  // useCallback to prevent the function from being recreated when the component rebuilds
  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      // retrieve the map and view from the map element
      const webmap = await mapElement.map;
      const view = await mapElement.view;

      // get the two layers from the webmap
      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      const waterDepthPercentageChangeLayer = webmap.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

      // get the layerView for the waterDepthPercentageChangeLayer
      const layerView = await view.whenLayerView(waterDepthPercentageChangeLayer);

      // set the layerView so it can be used in the rest of the component
      setLayerView(layerView);

      // =================================================================================================
      // load in two box plots from the webmap/feature layer
      const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

      // set the config and layer for box plots
      boxPlotRef1.current.config = boxPlotConfig1;
      boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef2.current.config = boxPlotConfig2;
      boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

      // set the default actions for the action bar based on the series type
      setDefaultActionBar(boxPlotActionBarRef.current, 'boxPlotSeries');

      // =================================================================================================
      // create new scatter plot with charts-model
      const scatterPlotParams = {
        layer: aquiferSaturatedThicknessLayer,
        xAxisFieldName: 'YEAR1974',
        yAxisFieldName: 'YEAR2014',
      };

      // create a new scatter plot model with the given parameters
      const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);

      // get the configuration from the scatter plot model
      const config = await scatterPlotModel.config;

      // set the config and layer to the scatter plot ref
      scatterPlotRef.current.config = config;
      scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;

      // set the default actions for the action bar based on the series type
      setDefaultActionBar(scatterPlotActionBarRef.current, 'scatterSeries');
    }
  }, [mapElement]);

  // handle selection. First remove the previous selection, then highlight the new selection
  // and enable/disable action bar buttons based on selection
  const handleArcgisChartsSelectionComplete = (actionBarRef: React.RefObject<HTMLArcgisChartsActionBarElement>) => (event: CustomEvent) => {
    const selectionData = event.detail.selectionOIDs;

    highlightSelect?.remove();
    highlightSelect = layerView.highlight(selectionData);

    // enabled/disable action bar buttons based on selection
    if (selectionData === undefined || selectionData.length === 0) {
      actionBarRef.current.disableClearSelection = true;
      actionBarRef.current.disableFilterBySelection = true;
    } else {
      actionBarRef.current.disableClearSelection = false;
      actionBarRef.current.disableFilterBySelection = false;
    }
  };

  // Register a function that will execute after the current render cycle
  useEffect(() => {
    initializeChart().catch(console.error);
  }, [initializeChart]);

  return (
    <div data-panel-id='charts'>
      <CalciteButton kind='inverse' icon-start='save' class='calcite-mode-dark' onClick={saveCharts}>
        Save Charts
      </CalciteButton>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data since 1974'>
        <ArcgisChartsBoxPlot ref={boxPlotRef1} onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(boxPlotActionBarRef)}>
          <ArcgisChartsActionBar slot='action-bar' ref={boxPlotActionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data in 2024'>
        <ArcgisChartsBoxPlot ref={boxPlotRef2} onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(boxPlotActionBarRef)}>
          <ArcgisChartsActionBar slot='action-bar' ref={boxPlotActionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Depth of Water (1974 vs 2024) sized by Saturated Thickness'>
        <ArcgisChartsScatterPlot ref={scatterPlotRef} onArcgisChartsSelectionComplete={handleArcgisChartsSelectionComplete(scatterPlotActionBarRef)}>
          <ArcgisChartsActionBar slot='action-bar' ref={scatterPlotActionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsScatterPlot>
        <CalciteIcon scale='s' slot='icon' icon='graph-scatter-plot'></CalciteIcon>
      </CalciteBlock>
    </div>
  );
}
