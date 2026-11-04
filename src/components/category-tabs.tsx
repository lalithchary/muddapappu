'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '⚡' },
  { id: 'mobiles', label: 'Mobiles', icon: '📱' },
  { id: 'laptops', label: 'Laptops', icon: '💻' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'footwear', label: 'Footwear', icon: '👟' },
  { id: 'beauty', label: 'Beauty', icon: '✨' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
];

export function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategories = searchParams?.get('cat')?.split(',') ?? [];

  function toggleCategory(catId: string) {
    const newCategories = activeCategories.includes(catId)
      ? activeCategories.filter((c) => c !== catId)
      : [...activeCategories, catId];

    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (newCategories.length > 0) {
      params.set('cat', newCategories.join(','));
    } else {
      params.delete('cat');
    }
    params.delete('page');
    router.replace(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => toggleCategory(cat.id)}
          className={cn(
            'category-btn',
            activeCategories.includes(cat.id) && 'active',
          )}
        >
          <span className="text-base">{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}