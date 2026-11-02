import type { StoreId, StoreInfo } from './types';

export const STORES: Record<StoreId, StoreInfo> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    shortName: 'Amazon',
    domain: 'amazon.in',
    color: '#FF9900',
    category: 'ecommerce',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart',
    shortName: 'Flipkart',
    domain: 'flipkart.com',
    color: '#2874F0',
    category: 'ecommerce',
  },
  myntra: {
    id: 'myntra',
    name: 'Myntra',
    shortName: 'Myntra',
    domain: 'myntra.com',
    color: '#FF3F6C',
    category: 'fashion',
  },
  ajio: {
    id: 'ajio',
    name: 'Ajio',
    shortName: 'Ajio',
    domain: 'ajio.com',
    color: '#6C5CE7',
    category: 'fashion',
  },
  swiggy: {
    id: 'swiggy',
    name: 'Swiggy',
    shortName: 'Swiggy',
    domain: 'swiggy.com',
    color: '#FC8019',
    category: 'food',
  },
  zomato: {
    id: 'zomato',
    name: 'Zomato',
    shortName: 'Zomato',
    domain: 'zomato.com',
    color: '#E23744',
    category: 'food',
  },
  zepto: {
    id: 'zepto',
    name: 'Zepto',
    shortName: 'Zepto',
    domain: 'zepto.app',
    color: '#F02E45',
    category: 'food',
  },
  bigbasket: {
    id: 'bigbasket',
    name: 'BigBasket',
    shortName: 'BigBasket',
    domain: 'bigbasket.com',
    color: '#68C458',
    category: 'food',
  },
};

export const STORE_LIST = Object.values(STORES);

export const CATEGORIES: { id: string; label: string; icon: string; stores: StoreId[] }[] = [
  { id: 'electronics', label: 'Electronics', icon: '⚡', stores: ['amazon', 'flipkart'] },
  { id: 'mobiles', label: 'Mobiles', icon: '📱', stores: ['amazon', 'flipkart'] },
  { id: 'laptops', label: 'Laptops', icon: '💻', stores: ['amazon', 'flipkart'] },
  { id: 'fashion', label: 'Fashion', icon: '👗', stores: ['myntra', 'ajio', 'amazon', 'flipkart'] },
  { id: 'footwear', label: 'Footwear', icon: '👟', stores: ['myntra', 'ajio', 'amazon', 'flipkart'] },
  { id: 'beauty', label: 'Beauty', icon: '✨', stores: ['amazon', 'flipkart', 'myntra'] },
  { id: 'home', label: 'Home & Kitchen', icon: '🏠', stores: ['amazon', 'flipkart'] },
  { id: 'grocery', label: 'Grocery & Food', icon: '🛒', stores: ['swiggy', 'zomato', 'zepto', 'bigbasket'] },
];

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

export function storeInfo(id: StoreId): StoreInfo {
  return STORES[id] ?? {
    id,
    name: id,
    shortName: id,
    domain: id,
    color: '#666',
    category: 'ecommerce',
  };
}
