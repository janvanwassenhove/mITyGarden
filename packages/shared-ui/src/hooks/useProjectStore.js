import { useStore } from "zustand";
import { projectStore } from "@mity-garden/domain";
export function useProjectStore(selector) {
    if (selector)
        return useStore(projectStore, selector);
    return useStore(projectStore);
}
//# sourceMappingURL=useProjectStore.js.map