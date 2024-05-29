import React, { createContext, useContext, useState } from "react";

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
  const [item, setItem] = useState(null); // 存储项目信息

  return (
    <DatabaseContext.Provider value={{ item, setItem }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
