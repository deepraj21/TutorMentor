
import React, { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const SearchBar = ({ className = '', placeholder, ...props }: SearchBarProps) => {
  return (
    <div className={`relative  ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
      <input
        type="search"
        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-full bg-white focus:ring-tutor-primary focus:border-tutor-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-tutor-accent dark:focus:border-tutor-accent "
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default SearchBar;
