"use client";

import { createContext, useContext } from "react";

interface OpsContextValue {
  founderMode: boolean;
}

export const OpsContext = createContext<OpsContextValue>({ founderMode: false });

export function useOpsContext(): OpsContextValue {
  return useContext(OpsContext);
}
