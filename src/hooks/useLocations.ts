import { useState, useEffect } from 'react';
import { locationsAPI } from '../lib/api';
import type { Location } from '../types';
import toast from 'react-hot-toast';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationsAPI.getAll();
      setLocations(data);
    } catch (err) {
      const errorMessage = 'Failed to fetch locations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (name: string) => {
    setLoading(true);
    try {
      const newLocation = await locationsAPI.create({ name, order_index: locations.length });
      setLocations(prev => [...prev, newLocation]);
      toast.success('Location added successfully!');
    } catch (err) {
      const errorMessage = 'Failed to add location';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: string, name: string) => {
    setLoading(true);
    try {
      const updatedLocation = await locationsAPI.update(id, { name });
      setLocations(prev => prev.map(loc => loc.id === id ? updatedLocation : loc));
      toast.success('Location updated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to update location';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    setLoading(true);
    try {
      await locationsAPI.delete(id);
      setLocations(prev => prev.filter(loc => loc.id !== id));
      toast.success('Location deleted successfully!');
    } catch (err) {
      const errorMessage = 'Failed to delete location';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderLocations = async (newOrder: Location[]) => {
    // Optimistically update the UI
    setLocations(newOrder);
    
    try {
      // Update order_index for each location
      const updates = newOrder.map((loc, index) => 
        locationsAPI.update(loc.id, { order_index: index })
      );
      await Promise.all(updates);
      toast.success('Locations reordered successfully!');
    } catch (err) {
      // Revert on error
      fetchLocations();
      const errorMessage = 'Failed to reorder locations';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    reorderLocations,
    refetch: fetchLocations,
  };
};