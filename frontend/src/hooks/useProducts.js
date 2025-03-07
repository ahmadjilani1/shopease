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
