import type { AssetDefinition } from "@mity-garden/domain";
export declare const ASSET_LIBRARY: AssetDefinition[];
export declare function getAssetById(id: string): AssetDefinition | undefined;
export declare function getAssetsByType(type: AssetDefinition["type"]): AssetDefinition[];
export declare function searchAssets(query: string): AssetDefinition[];
export declare function getAssetCategories(): Map<string, AssetDefinition[]>;
//# sourceMappingURL=definitions.d.ts.map
