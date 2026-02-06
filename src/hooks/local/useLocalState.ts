import { useState, useCallback, useEffect } from 'react'

// Hook pour gérer l'état de chargement
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  
  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), [])
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  }
}

// Hook pour gérer l'état d'erreur
export function useError() {
  const [error, setError] = useState<string | null>(null)
  
  const setErrorMessage = useCallback((message: string) => setError(message), [])
  const clearError = useCallback(() => setError(null), [])
  
  return {
    error,
    setErrorMessage,
    clearError,
  }
}

// Hook pour gérer l'état de formulaire
export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])
  
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])
  
  const setFieldTouched = useCallback(<K extends keyof T>(field: K, touched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touched }))
  }, [])
  
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])
  
  const isValid = Object.keys(errors).length === 0
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldError,
    setFieldTouched,
    reset,
    isValid,
  }
}

// Hook pour gérer l'état de modal/dialog
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)
  
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  
  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

// Hook pour gérer l'état de pagination
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  
  const nextPage = useCallback(() => setPage(prev => prev + 1), [])
  const prevPage = useCallback(() => setPage(prev => Math.max(1, prev - 1)), [])
  const goToPage = useCallback((newPage: number) => setPage(Math.max(1, newPage)), [])
  const reset = useCallback(() => {
    setPage(initialPage)
    setLimit(initialLimit)
  }, [initialPage, initialLimit])
  
  return {
    page,
    limit,
    setPage: goToPage,
    setLimit,
    nextPage,
    prevPage,
    reset,
  }
}

// Hook pour gérer l'état de sélection multiple
export function useMultiSelect<T>(initialSelection: T[] = []) {
  const [selected, setSelected] = useState<T[]>(initialSelection)
  
  const toggle = useCallback((item: T) => {
    setSelected(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }, [])
  
  const select = useCallback((item: T) => {
    setSelected(prev => 
      prev.includes(item) ? prev : [...prev, item]
    )
  }, [])
  
  const deselect = useCallback((item: T) => {
    setSelected(prev => prev.filter(i => i !== item))
  }, [])
  
  const selectAll = useCallback((items: T[]) => {
    setSelected(items)
  }, [])
  
  const clear = useCallback(() => {
    setSelected([])
  }, [])
  
  const isSelected = useCallback((item: T) => {
    return selected.includes(item)
  }, [selected])
  
  return {
    selected,
    toggle,
    select,
    deselect,
    selectAll,
    clear,
    isSelected,
  }
}

// Hook pour gérer l'état de recherche avec debounce
export function useSearch(initialValue = '', delay = 300) {
  const [query, setQuery] = useState(initialValue)
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue)
  
  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [query, delay])
  
  const clear = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])
  
  return {
    query,
    debouncedQuery,
    setQuery,
    clear,
  }
}
