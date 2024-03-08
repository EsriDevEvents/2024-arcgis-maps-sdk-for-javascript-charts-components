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
  const boxPlotRef1 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const boxPlotRef2 = useRef<HTMLArcgisChartsBoxPlotElement>(null);
  const scatterPlotRef = useRef<HTMLArcgisChartsScatterPlotElement>(null);

  const boxPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);
  const scatterPlotActionBarRef = useRef<HTMLArcgisChartsActionBarElement>(null);

  const [layerView, setLayerView] = useState(null);

  let highlightSelect: IHandle | undefined;

  const saveCharts = async () => {
    if (mapElement !== null) {
      const webmap = mapElement.map;
      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;

      const scatterPlotConfig = scatterPlotRef.current.config;
      aquiferSaturatedThicknessLayer.charts.push(scatterPlotConfig);

      await webmap.save();
    }
  };

  const initializeChart = useCallback(async () => {
    if (mapElement !== null) {
      const webmap = mapElement.map;
      const view = mapElement.view;

      const aquiferSaturatedThicknessLayer = webmap.findLayerById('18dfc8cf7b7-layer-16') as FeatureLayer;
      const waterDepthPercentageChangeLayer = webmap.findLayerById('18df37f7e52-layer-67') as FeatureLayer;

      const layerView = await view.whenLayerView(waterDepthPercentageChangeLayer);

      setLayerView(layerView);

      const boxPlotConfig1 = waterDepthPercentageChangeLayer.charts[0];
      const boxPlotConfig2 = waterDepthPercentageChangeLayer.charts[1];

      boxPlotRef1.current.config = boxPlotConfig1;
      boxPlotRef1.current.layer = waterDepthPercentageChangeLayer;

      boxPlotRef2.current.config = boxPlotConfig2;
      boxPlotRef2.current.layer = waterDepthPercentageChangeLayer;

      setDefaultActionBar(boxPlotActionBarRef.current, 'boxPlotSeries');

      const scatterPlotParams = {
        layer: aquiferSaturatedThicknessLayer,
        xAxisFieldName: 'YEAR1974',
        yAxisFieldName: 'YEAR2014',
      };

      const scatterPlotModel = new ScatterPlotModel(scatterPlotParams);

      const config = await scatterPlotModel.config;

      scatterPlotRef.current.config = config;
      scatterPlotRef.current.layer = aquiferSaturatedThicknessLayer;

      setDefaultActionBar(scatterPlotActionBarRef.current, 'scatterSeries');
    }
  }, [mapElement]);

  const handleArcgisChartsSelectionComplete = (actionBarRef: React.RefObject<HTMLArcgisChartsActionBarElement>) => (event: CustomEvent) => {
    const selectionData = event.detail.selectionOIDs;

    highlightSelect?.remove();
    highlightSelect = layerView.highlight(selectionData);

    if (selectionData === undefined || selectionData.length === 0) {
      actionBarRef.current.disableClearSelection = true;
      actionBarRef.current.disableFilterBySelection = true;
    } else {
      actionBarRef.current.disableClearSelection = false;
      actionBarRef.current.disableFilterBySelection = false;
    }
  };

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
