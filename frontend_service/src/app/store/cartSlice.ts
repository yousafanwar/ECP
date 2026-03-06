import { createSlice } from "@reduxjs/toolkit";

interface cartState {
    items: string[];
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
        updateCount(state, action) {
            state.count = action.payload;
            localStorage.setItem('cartCount', action.payload.toString());
        },
        addItem(state, action) {
            state.items.push(action.payload);
        },
        removeItem(state, action) {
            state.items = state.items.filter(id => id !== action.payload);
            state.count = Math.max(0, state.count - 1);
            localStorage.setItem('cartCount', state.count.toString());
        },
        resetCount(state) {
            state.items = [];
            state.count = 0;
            localStorage.removeItem('cartCount');
        }
    }
});

export const { addItem, updateCount, resetCount, removeItem } = cartSlice.actions;
export default cartSlice.reducer;
