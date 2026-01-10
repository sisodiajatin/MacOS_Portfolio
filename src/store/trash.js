import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useTrashStore = create(
    immer((set) => ({
        trashedItems: [],
        isEmpty: true,

        addToTrash: (item) =>
            set((state) => {
                state.trashedItems.push({
                    ...item,
                    trashedAt: new Date().toISOString(),
                });
                state.isEmpty = false;
            }),

        removeFromTrash: (itemId) =>
            set((state) => {
                state.trashedItems = state.trashedItems.filter(
                    (item) => item.id !== itemId
                );
                state.isEmpty = state.trashedItems.length === 0;
            }),

        emptyTrash: () =>
            set((state) => {
                state.trashedItems = [];
                state.isEmpty = true;
            }),

        restoreItem: (itemId) =>
            set((state) => {
                state.trashedItems = state.trashedItems.filter(
                    (item) => item.id !== itemId
                );
                state.isEmpty = state.trashedItems.length === 0;
            }),
    }))
);

export default useTrashStore;
