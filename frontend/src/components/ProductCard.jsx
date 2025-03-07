// src/components/ProductCard.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  
  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    }));
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="relative">
        <Link to={`/product/${product._id}`}>
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
        </Link>
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-300"
          aria-label="Add to wishlist"
        >
          <FaHeart />
        </button>
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"} />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-1">({product.reviewCount})</span>
        </div>
        
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-2">{product.category}</p>
        
        <div className="flex justify-between items-center">
          <div>
            {product.discount > 0 ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900">
                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors duration-300"
            aria-label="Add to cart"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

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

// src/hooks/useProducts.js
import { useQuery } from 'react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const useProducts = (category, filters = {}, sort = '', search = '', page = 1, limit = 12) => {
  return useQuery(
    ['products', category, filters, sort, search, page, limit],
    async () => {
      let query = `${API_URL}/products?page=${page}&limit=${limit}`;
      
      if (category) {
        query += `&category=${category}`;
      }
      
      if (search) {
        query += `&search=${search}`;
      }
      
      if (sort) {
        query += `&sort=${sort}`;
      }
      
      // Add filters to query
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(val => {
            query += `&${key}=${val}`;
          });
        } else if (value) {
          query += `&${key}=${value}`;
        }
      });
      
      const { data } = await axios.get(query);
      return data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );
};

export const useProduct = (id) => {
  return useQuery(
    ['product', id],
    async () => {
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      return data;
    },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};
