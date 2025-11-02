import { createSlice } from "@reduxjs/toolkit";

interface cartState {
    items: number[];
    count: number;
}

const initialState: cartState = {
    items: [],
    count: 0
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        incrementCount(state, action) {
            state.items.push(action.payload);
            state.count += 1;
        },
        decrementCount(state) {
            state.count -= 1;
        },
        removeItem(state, action) {
            state.items = state.items.filter(id => id !== action.payload);
            state.count = state.items.length;
        },
        resetCount(state) {
            state.items = [];
            state.count = 0;
        }
    }
});

export const { incrementCount, decrementCount, resetCount, removeItem } = cartSlice.actions;
export default cartSlice.reducer;
