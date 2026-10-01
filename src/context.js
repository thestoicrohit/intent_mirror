import { createContext, useContext } from 'react'

// Lives in its own module so lazily-loaded screens don't import App.jsx (which imports them).
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)
