import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { searchCities, type City } from '../data/cities';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  countryFilter?: 'Nepal' | 'India';
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Enter city',
  required = false,
  className = '',
  label,
  countryFilter,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search cities instantly (local search is fast, no debounce needed)
  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.trim().length === 0) {
      return [];
    }
    return searchCities(inputValue, 6, countryFilter);
  }, [inputValue, countryFilter]);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    // Open dropdown if there's input, close if empty
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectCity = useCallback((city: City) => {
    setIsSelecting(true);
    setInputValue(city.name);
    onChange(city.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    // Reset selecting flag after a tick
    requestAnimationFrame(() => setIsSelecting(false));
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
    }

    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectCity(suggestions[highlightedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectCity(suggestions[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectCity(suggestions[highlightedIndex]);
        }
        setIsOpen(false);
        break;
    }
  };

  const handleBlur = () => {
    // Use requestAnimationFrame to let mousedown events fire first
    requestAnimationFrame(() => {
      if (isSelecting) return;
      if (inputValue !== value) {
        onChange(inputValue);
      }
      setIsOpen(false);
    });
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && inputValue.trim().length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base z-10" />
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-sm sm:text-base ${className}`}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.state}-${city.country}`}
              className={`px-3 py-2.5 cursor-pointer flex items-center gap-2 transition-colors ${
                index === highlightedIndex
                  ? 'bg-indigo-50 text-indigo-900'
                  : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectCity(city);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <FaMapMarkerAlt className="text-indigo-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {city.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {city.state}, {city.country}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  city.country === 'Nepal'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {city.country === 'Nepal' ? '🇳🇵' : '🇮🇳'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
