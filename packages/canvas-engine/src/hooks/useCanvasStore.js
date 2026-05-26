import { useStore } from "zustand";
import { canvasStore } from "@mity-garden/domain";
export function useCanvasStore(selector) {
    if (selector) {
        return useStore(canvasStore, selector);
    }
    return useStore(canvasStore);
}
//# sourceMappingURL=useCanvasStore.js.map