import type {
  GardenProject,
  GardenElement,
  Layer,
  UnitSystem,
  GardenStyle,
  GardenGoal,
  Locale,
  Dimensions,
  ElementType,
  Position,
} from "./types.js";
export declare function createProject(overrides?: Partial<GardenProject>): GardenProject;
export declare function createLayer(name: string, order: number): Layer;
export declare function createElement(
  assetId: string,
  type: ElementType,
  position: Position,
  size: Dimensions,
  overrides?: Partial<GardenElement>
): GardenElement;
export declare function normalizeRotation(degrees: number): number;
export declare function metersToPixels(meters: number, pixelsPerMeter: number): number;
export declare function pixelsToMeters(pixels: number, pixelsPerMeter: number): number;
export declare const BASE_PIXELS_PER_METER = 50;
export declare const DEFAULT_GRID_SIZE = 1;
export declare function snapToGrid(value: number, gridSize: number): number;
export declare const SUPPORTED_LOCALES: Locale[];
export declare const UNIT_SYSTEMS: UnitSystem[];
export declare const GARDEN_STYLES: GardenStyle[];
export declare const GARDEN_GOALS: GardenGoal[];
//# sourceMappingURL=factories.d.ts.map
