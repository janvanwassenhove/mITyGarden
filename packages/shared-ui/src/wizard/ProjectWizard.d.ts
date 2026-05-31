import React from "react";
import type { MapsAdapter } from "@mity-garden/maps";
interface GmLatLng {
  lat(): number;
  lng(): number;
}
interface GmLatLngBounds {
  extend(point: { lat: number; lng: number }): void;
}
interface GmMvcArray<T> {
  getArray(): T[];
}
interface GmPolygon {
  getPath(): GmMvcArray<GmLatLng>;
  setMap(map: GmMap | null): void;
}
interface GmMap {
  fitBounds(bounds: GmLatLngBounds): void;
}
interface GmDrawingManager {
  setMap(map: GmMap | null): void;
  setDrawingMode(mode: string | null): void;
}
interface LMap {
  on(
    event: "click",
    handler: (e: {
      latlng: {
        lat: number;
        lng: number;
      };
    }) => void
  ): void;
  remove(): void;
  setView(center: [number, number], zoom: number): LMap;
}
interface LCircleMarker {
  addTo(map: LMap): LCircleMarker;
  remove(): void;
}
interface LPolyline {
  addTo(map: LMap): LPolyline;
  remove(): void;
}
interface LPolygon {
  addTo(map: LMap): LPolygon;
  remove(): void;
}
interface LTileLayer {
  addTo(map: LMap): LTileLayer;
}
interface LeafletStatic {
  map(el: HTMLElement, opts?: object): LMap;
  tileLayer(url: string, opts?: object): LTileLayer;
  circleMarker(latlng: [number, number], opts?: object): LCircleMarker;
  polyline(latlngs: [number, number][], opts?: object): LPolyline;
  polygon(latlngs: [number, number][], opts?: object): LPolygon;
}
type GmMapConstructor = new (
  el: HTMLElement,
  opts: {
    center: {
      lat: number;
      lng: number;
    };
    zoom: number;
    mapTypeId?: string;
  }
) => GmMap;
type GmPolygonConstructor = new (opts: {
  paths?: {
    lat: number;
    lng: number;
  }[];
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
  editable?: boolean;
}) => GmPolygon;
type GmLatLngBoundsConstructor = new () => GmLatLngBounds;
type GmDrawingManagerConstructor = new (opts: {
  drawingMode?: string | null;
  drawingControl?: boolean;
  drawingControlOptions?: {
    position: number;
    drawingModes: string[];
  };
  polygonOptions?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
    editable?: boolean;
  };
}) => GmDrawingManager;
declare global {
  interface Window {
    google?: {
      maps: {
        Map: GmMapConstructor;
        Polygon: GmPolygonConstructor;
        LatLngBounds: GmLatLngBoundsConstructor;
        event: {
          addListener(
            target: GmDrawingManager,
            event: "polygoncomplete",
            handler: (polygon: GmPolygon) => void
          ): unknown;
        };
        drawing: {
          DrawingManager: GmDrawingManagerConstructor;
          OverlayType: {
            POLYGON: string;
          };
        };
        ControlPosition: {
          TOP_CENTER: number;
        };
      };
    };
    L?: LeafletStatic;
  }
}
export interface ProjectWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  mapsAdapter?: MapsAdapter;
  googleMapsApiKey?: string;
}
export declare function ProjectWizard({
  onComplete,
  onCancel,
  mapsAdapter,
  googleMapsApiKey,
}: ProjectWizardProps): React.ReactElement;
export {};
//# sourceMappingURL=ProjectWizard.d.ts.map
