export type GeoJsonCoordinates = number[] | number[][] | number[][][];

export interface GeoJsonGeometry {
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon';
  coordinates: GeoJsonCoordinates;
}

export interface GeoJsonFeatureProperties {
  nodeType:
    | 'TANK'
    | 'CONNECTION'
    | 'VIRTUAL_LINK'
    | 'TRANSMISSION_LINK'
    | 'BOMBEO'
    | 'PLANTA'
    | 'TANQUE'
    | 'CAPTACION'
    | string;
  name?: string;
  code?: string;
  facilityType?: string;
  colorMarker?: string;
  connectionId?: string;
  cadastralKey?: string;
  suppliedByTank?: string;
  supplierType?: string;
  source?: string;
  sourceCode?: string;
  sourceType?: string;
  destination?: string;
  destinationCode?: string;
  destinationType?: string;
  pipelineMaterial?: string;
  pipelineDiameterMm?: number;
  distanceInMeters?: number;
}

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string;
  geometry: GeoJsonGeometry;
  properties: GeoJsonFeatureProperties;
}

export interface MapGeojsonResponse {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}
