// src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const initialState = {
  items: localStorage.getItem('cartItems') 
    ? JSON.parse(localStorage.getItem('cartItems')) 
    : [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
      
      toast.success(`${newItem.name} added to cart!`);
    },
    
    removeFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        state.items = state.items.filter(item => item.id !== id);
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Save to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
        
        toast.info(`Item removed from cart`);
      }
    },
    
    decreaseQuantity(state, action) {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(item => item.id !== id);
        } else {
          existingItem.quantity--;
        }
        
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Save to localStorage
        localStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
      
      toast.info(`Cart cleared`);
    },
  },
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
