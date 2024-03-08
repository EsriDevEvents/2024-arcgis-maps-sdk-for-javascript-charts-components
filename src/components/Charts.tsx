import { useEffect, useRef, useCallback } from 'react';
import { CalciteIcon, CalciteBlock, CalciteButton } from '@esri/calcite-components-react';

import { ArcgisChartsActionBar, ArcgisChartsBoxPlot, ArcgisChartsScatterPlot } from '@arcgis/charts-components-react';
import { ScatterPlotModel } from '@arcgis/charts-model';

import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import './Charts.css';

// set the default action bar based on the series type
function setDefaultActionBar(actionBarRef: any, seriesType: string) {
  const actionBarElement = actionBarRef.current;

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

export default function Charts({ mapElement }: any) {
  const boxPlotRef1 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const boxPlotRef2 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const scatterPlotRef = useRef<HTMLArcgisChartsScatterPlotElement>(null);

  const boxPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);
  const scatterPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);

  const saveCharts = async () => {
    if (mapElement !== null) {
      const webmap = await mapElement.map;
      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;

      const scatterPlotConfig = scatterPlotRef.current.config;
      aquiferSaturatedThicknessLayer.charts.push(scatterPlotConfig);

      await webmap.save();
    }
  };

  // useCallback to prevent the function from being recreated when the component rebuilds
  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      const webmap = await mapElement.map;
      const view = await mapElement.view;

      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      const waterDepthPercentageChangeLayer = webmap.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

      const layerView = await view.whenLayerView(waterDepthPercentageChangeLayer);

      // handle selection
      const handleArcgisChartsSelectionComplete = (event: CustomEvent) => {
        mapElement.highlightSelect?.remove();
        mapElement.highlightSelect = layerView.highlight(event.detail.selectionOIDs);
      };

      // =================================================================================================
      // load in two box plots from the webmap/feature layer
      const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

      boxPlotRef1.current.config = boxPlotConfig1;
      boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef2.current.config = boxPlotConfig2;
      boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef1.current.addEventListener('arcgisChartsSelectionComplete', handleArcgisChartsSelectionComplete);

      boxPlotRef1.current.addEventListener('arcgisChartsSelectionComplete', (event: CustomEvent) => {
        const selectionData = event.detail;
        if (selectionData.selectionOIDs === undefined || selectionData.selectionOIDs.length === 0) {
          scatterPlotActionBarRef.current.disableClearSelection = true;
          scatterPlotActionBarRef.current.disableFilterBySelection = true;
        } else {
          scatterPlotActionBarRef.current.disableClearSelection = false;
          scatterPlotActionBarRef.current.disableFilterBySelection = false;
        }
      });

      // set the default actions for the action bar based on the series type
      setDefaultActionBar(boxPlotActionBarRef, 'boxPlotSeries');

      // =================================================================================================
      // create new scatter plot with charts-model
      const scatterPlotParams = {
        layer: aquiferSaturatedThicknessLayer,
        xAxisFieldName: 'YEAR1974',
        yAxisFieldName: 'YEAR2014',
      };

      const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);

      const config = await scatterPlotModel.config;

      scatterPlotRef.current.config = config;
      scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;

      // add event listener when selection is made on the chart to enable/disable action bar buttons
      scatterPlotRef.current.addEventListener('arcgisChartsSelectionComplete', (event: CustomEvent) => {
        const selectionData = event.detail;
        if (selectionData.selectionOIDs === undefined || selectionData.selectionOIDs.length === 0) {
          scatterPlotActionBarRef.current.disableClearSelection = true;
          scatterPlotActionBarRef.current.disableFilterBySelection = true;
        } else {
          scatterPlotActionBarRef.current.disableClearSelection = false;
          scatterPlotActionBarRef.current.disableFilterBySelection = false;
        }
      });

      // set the default actions for the action bar based on the series type
      setDefaultActionBar(scatterPlotActionBarRef, 'scatterSeries');
    }
  }, [mapElement]);

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
        <ArcgisChartsBoxPlot ref={boxPlotRef1}>
          <ArcgisChartsActionBar slot='action-bar' ref={boxPlotActionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data in 2024'>
        <ArcgisChartsBoxPlot ref={boxPlotRef2}></ArcgisChartsBoxPlot>
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Depth of Water (1974 vs 2024) sized by Saturated Thickness'>
        <ArcgisChartsScatterPlot ref={scatterPlotRef}>
          <ArcgisChartsActionBar slot='action-bar' ref={scatterPlotActionBarRef}></ArcgisChartsActionBar>
        </ArcgisChartsScatterPlot>
        <CalciteIcon scale='s' slot='icon' icon='graph-scatter-plot'></CalciteIcon>
      </CalciteBlock>
    </div>
  );
}
