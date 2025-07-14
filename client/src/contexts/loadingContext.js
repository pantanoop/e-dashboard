import { createContext, useState, useContext } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {loading && (
        <div className="global-spinner loader">
          <div className="spinner"></div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
