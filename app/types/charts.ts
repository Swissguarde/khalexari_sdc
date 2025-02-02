import { LoadType } from "./calculator";

export interface ChartData {
  position: number;
  bendingMoment: number;
  shearForce: number;
}

export interface SpanData {
  loadType: LoadType;
  length: number;
  points: {
    position: number;
    bendingMoment: number;
    shearForce: number;
  }[];
}
