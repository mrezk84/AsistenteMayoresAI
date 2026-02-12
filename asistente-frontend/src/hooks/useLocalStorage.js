import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar localStorage
 * @param {string} key - Clave para localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 */
export function useLocalStorage(key, initialValue = null) {
  // Obtener valor inicial de localStorage o usar el valor por defecto
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading "${key}" from localStorage:`, error);
      return initialValue;
    }
  });

  // Actualizar localStorage cuando el valor cambia
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving "${key}" to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
