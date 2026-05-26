import { useStore } from "zustand";
import { uiStore } from "@mity-garden/domain";
export function useUiStore(selector) {
    if (selector)
        return useStore(uiStore, selector);
    return useStore(uiStore);
}
//# sourceMappingURL=useUiStore.js.map