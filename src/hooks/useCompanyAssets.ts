import { useState, useEffect } from 'react';

export interface CompanyAsset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = 'jd_company_assets';

const defaultAssets: CompanyAsset[] = [
  {
    id: '1',
    name: 'Laptop',
    description: 'Company-issued laptop computer',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile Phone',
    description: 'Company mobile phone',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Access Card',
    description: 'Building access card',
    createdAt: new Date().toISOString(),
  },
];

export const useCompanyAssets = () => {
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAssets(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading company assets:', error);
        setAssets(defaultAssets);
      }
    } else {
      setAssets(defaultAssets);
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever assets change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    }
  }, [assets, loading]);

  const addAsset = (name: string, description?: string) => {
    const newAsset: CompanyAsset = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, name: string, description?: string) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.id === id ? { ...asset, name, description } : asset
      )
    );
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
  };
};
