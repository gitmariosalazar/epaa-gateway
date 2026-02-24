export interface LocationResponse {
  locationId: number;
  coordinates: string; // POINT(lon lat) format
  metadata: { [key: string]: any };
  connectionId: string;
  createdAt?: Date;
}