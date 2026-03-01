"use client";

import { ReduxProvider } from "@/redux/Provider";

export default function ReduxProviderClient({ children }: { children: React.ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
