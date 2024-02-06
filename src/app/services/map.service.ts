import { Injectable } from '@angular/core';
import { View, Feature } from 'ol';
import {
  Extent,
  getTopLeft,
  getTopRight,
  getBottomRight,
  getBottomLeft,
} from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import BingMaps from 'ol/source/BingMaps.js';

import { Geometry } from 'ol/geom';
import Draw, { DrawEvent, createRegularPolygon } from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import { transformExtent } from 'ol/proj';
import { GeoTIFF, OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Subject } from 'rxjs';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/WebGLTile.js';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private drawEnd$$ = new Subject<number[]>();
  private map: Map;
  private bing = new TileLayer({
    source: new BingMaps({
      key: 'Aka7WBWlT_uiKpqkCaYfCD97redC9OP0miLCvbYige0eH41SNyBiz2KgMDPAlqUE',
      imagerySet: 'Aerial',
    }),
  });
  private osm = new TileLayer({
    source: new OSM(),
  })
  geoTiffLayer: TileLayer = new TileLayer({});

  public drawEnd$ = this.drawEnd$$.asObservable();
  constructor() {
    this.map = this.createMap('map');
  }

  public setSource(image: Blob | null, extent: number[]) {
    console.log(`Set Source ${image} ${extent}`);
    if (image === null) {
      return;
    }
    const source = new GeoTIFF({
      sources: [
        {
          blob: image,
        },
      ],
    });
    console.log(source);
    console.log(extent);
    const extentEPSG3857: number[] = transformExtent(
      extent!,
      'EPSG:4326',
      'EPSG:3857'
    );
    console.log(extentEPSG3857);
    this.geoTiffLayer.setExtent(extentEPSG3857);
    this.geoTiffLayer.setSource(source);
  }

  public setMapSource(mapSource: string) {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({ wrapX: false }),
    });
    let layers = [
      this.resolve(mapSource),
      this.geoTiffLayer,
      vectorLayer,
    ];
    this.map.setLayers(layers);
    this.map.render();
  }

  private resolve(mapSource: string) {
    if (mapSource === 'Aerial') {
      return this.bing;
    } else {
      return this.osm;
    }
  }

  private createMap(targetElementId: string): Map {
    this.initGeoTiff3BandsLayer();

    const vectorLayer = new VectorLayer({
      source: new VectorSource({ wrapX: false }),
    });
    const drawInteraction = this.createBBoxDrawInteraction(
      vectorLayer.getSource()!
    );
    const map = new Map({
      view: new View({
        center: [0, 0],
        zoom: 0,
        projection: 'EPSG:3857',
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.geoTiffLayer,
        vectorLayer,
      ],
    });
    map.addInteraction(drawInteraction);

    setTimeout(() => {
      map.setTarget(targetElementId);
    }, 0);

    return map;
  }

  private onDrawEnd(e: DrawEvent): void {
    const feature: Feature<Geometry> = e.feature;

    var writer = new GeoJSON();
    writer.writeGeometry(feature.getGeometry()!);

    const extent: Extent = feature.getGeometry()?.getExtent()!;
    const extentEPSG4326: number[] = transformExtent(
      extent!,
      'EPSG:3857',
      'EPSG:4326'
    );

    const extentCoords = [
      getTopLeft(extentEPSG4326),
      getTopRight(extentEPSG4326),
      getBottomRight(extentEPSG4326),
      getBottomLeft(extentEPSG4326),
    ];
    this.drawEnd$$.next(extentEPSG4326);
  }

  private createBBoxDrawInteraction(source: VectorSource) {
    const drawInteraction = new Draw({
      source: source,
      type: 'Circle',
      geometryFunction: createRegularPolygon(4, 150),
    });
    drawInteraction.on('drawend', (e: DrawEvent) => this.onDrawEnd(e));
    return drawInteraction;
  }

  private initGeoTiff3BandsLayer() {
    this.geoTiffLayer = new TileLayer({
      style: {
        variables: { red: 1, green: 2, blue: 3 },
        color: [
          'array',
          ['band', ['var', 'red']],
          ['band', ['var', 'green']],
          ['band', ['var', 'blue']],
          1,
        ],
      },
    });
  }
}
