import React, {createContext, useContext, useState, ReactNode} from 'react';

type FilterState = {
  assignedUserId: string | null;
  dueDate: 'over due' | 'today' | 'tomorrow' | 'week' | 'month' | null;
  status: 'completed' | 'incomplete' | null;
};

type FilterContextType = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

type FilterProviderProps = {
  children: ReactNode;
};

export const FilterProvider: React.FC<FilterProviderProps> = ({children}) => {
  const [filters, setFilters] = useState<FilterState>({
    assignedUserId: null,
    dueDate: null,
    status: null,
  });

  return (
    <FilterContext.Provider value={{filters, setFilters}}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
