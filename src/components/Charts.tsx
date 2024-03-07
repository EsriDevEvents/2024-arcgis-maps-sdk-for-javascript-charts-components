import { useEffect, useRef, useCallback } from 'react';
import { CalciteIcon, CalciteBlock } from '@esri/calcite-components-react';

import { ArcgisChartsActionBar, ArcgisChartsBoxPlot, ArcgisChartsScatterPlot } from '@arcgis/charts-components-react';
import { ScatterPlotModel } from '@arcgis/charts-model';

import { loadWebmap } from '../functions/load-data';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import './Charts.css';
// set the default action bar based on the series type
function setDefaultActionBar(chartElementId: string, seriesType: string) {
  const actionBarElement = document.getElementById(chartElementId) as HTMLArcgisChartsActionBarElement;

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

export default function Charts() {
  const boxPlotRef1 = useRef(null);
  const boxPlotRef2 = useRef(null);
  const scatterPlotRef = useRef(null);

  // useCallback to prevent the function from being recreated when the component rebuilds
  const initializeChart = useCallback(async () => {
    const webmap = await loadWebmap();

    const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
    const waterDepthPercentageChangeLayer = webmap.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

    // =================================================================================================
    // load in two box plots from the webmap/feature layer
    const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
    const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

    boxPlotRef1.current.config = boxPlotConfig1;
    boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

    boxPlotRef2.current.config = boxPlotConfig2;
    boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

    // =================================================================================================
    // create new scatter plot with charts-model
    const scatterPlotParams = {
      layer: aquiferSaturatedThicknessLayer,
      xAxisFieldName: 'YEAR1974',
      yAxisFieldName: 'YEAR2024',
    };

    const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);

    const config = await scatterPlotModel.config;

    scatterPlotRef.current.config = config;
    scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;

    // add event listener when selection is made on the chart to enable/disable action bar buttons
    scatterPlotRef.current.addEventListener('arcgisChartsSelectionComplete', (event: CustomEvent) => {
      const actionBarElement = document.getElementById('scatter-plot-action-bar') as HTMLArcgisChartsActionBarElement;

      const selectionData = event.detail;
      if (selectionData.selectionOIDs === undefined || selectionData.selectionOIDs.length === 0) {
        actionBarElement.disableClearSelection = true;
        actionBarElement.disableFilterBySelection = true;
      } else {
        actionBarElement.disableClearSelection = false;
        actionBarElement.disableFilterBySelection = false;
      }
    });

    // set the default actions for the action bar based on the series type
    setDefaultActionBar('scatter-plot-action-bar', config.series[0].type);
  }, []);

  // Register a function that will execute after the current render cycle
  useEffect(() => {
    initializeChart().catch(console.error);
  }, [initializeChart]);

  return (
    <div data-panel-id='charts'>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data since 1974'>
        <ArcgisChartsBoxPlot ref={boxPlotRef1}></ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data in 2024'>
        <ArcgisChartsBoxPlot ref={boxPlotRef2}></ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Depth of Water (1974 vs 2024) sized by Saturated Thickness'>
        <ArcgisChartsScatterPlot ref={scatterPlotRef}>
          <ArcgisChartsActionBar slot='action-bar' id='scatter-plot-action-bar'></ArcgisChartsActionBar>
        </ArcgisChartsScatterPlot>
        <CalciteIcon scale='s' slot='icon' icon='graph-scatter-plot'></CalciteIcon>
      </CalciteBlock>
    </div>
  );
}
