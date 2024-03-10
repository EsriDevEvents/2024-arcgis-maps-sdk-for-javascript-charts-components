import { useEffect, useRef, useState, useCallback } from 'react';
import { CalciteIcon, CalciteBlock, CalciteButton } from '@esri/calcite-components-react';
import { ArcgisChartsActionBar, ArcgisChartsBoxPlot, ArcgisChartsScatterPlot } from '@arcgis/charts-components-react';
import { ScatterPlotModel } from '@arcgis/charts-model';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import './Charts.css';

interface ChartsProps {
  mapElement: HTMLArcgisMapElement;
}

export default function Charts({ mapElement }: ChartsProps) {
  // STEP 2: Create refs for the box plots and scatterplot
  // const boxPlotRef1 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  // const boxPlotRef2 = useRef<HTMLArcgisChartsBoxPlotElement>(null);

  // const scatterPlotRef = useRef<HTMLArcgisChartsScatterPlotElement>(null);

  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      // STEP 3: Get the map object from the mapElemet prop being passed in from map-component event listener
      // const map = mapElement.map;
      //
      // STEP 4: Get the aquiferSaturatedThicknessLayer and waterDepthPercentageChangeLayer from the mao by the unique layerId
      // const waterDepthPercentageChangeLayer = map.findLayerById('18df37f7e52-layer-67') as FeatureLayer;
      //
      // STEP 5: Get the box plot configs from the waterDepthPercentageChangeLayer
      // const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      // const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];
      //
      // STEP 6: Set the config and layer for the box plots
      // boxPlotRef1.current.config = boxPlotConfig1;
      // boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;
      // boxPlotRef2.current.config = boxPlotConfig2;
      // boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;
      // ======================== Scatterplot (with Model) ===================================================
      // STEP 1: Create scatter plot params
      // const aquiferSaturatedThicknessLayer = map.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      // const scatterPlotParams = {
      //   layer: aquiferSaturatedThicknessLayer,
      //   xAxisFieldName: 'YEAR1974',
      //   yAxisFieldName: 'YEAR2014',
      // };
      //
      // STEP 2: Create a new scatter plot model with the scatter plot params
      // const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);
      //
      // STEP 3: Get the config from the scatter plot model
      // const config = await scatterPlotModel.config;
      //
      // STEP 4: Set the config and layer for the scatter plot
      // scatterPlotRef.current.config = config;
      // scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;
    }
  }, [mapElement]);

  // Use effect to initialize the chart
  useEffect(() => {
    initializeChart().catch(console.error);
  }, [initializeChart]);

  // STEP 1: Add the ArcgisChartsBoxPlot and ArcgisChartsScatterPlot components to the CalciteBlocks
  return (
    <div data-panel-id='charts'>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data since 1974'>
        {/* <ArcgisChartsBoxPlot></ArcgisChartsBoxPlot> */}
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Distribution of Water Measurement Data in 2024'>
        {/* <ArcgisChartsBoxPlot></ArcgisChartsBoxPlot> */}
        <CalciteIcon scale='s' slot='icon' icon='box-chart'></CalciteIcon>
      </CalciteBlock>
      <CalciteBlock class='chart-block' collapsible heading='Depth of Water (1974 vs 2024) sized by Saturated Thickness'>
        {/* <ArcgisChartsScatterPlot></ArcgisChartsScatterPlot> */}
        <CalciteIcon scale='s' slot='icon' icon='graph-scatter-plot'></CalciteIcon>
      </CalciteBlock>
    </div>
  );
}
