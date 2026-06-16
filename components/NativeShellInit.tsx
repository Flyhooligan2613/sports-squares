"use client";

import { useEffect } from "react";

export default function NativeShellInit() {
  useEffect(() => {
    void import("@/mobile/native/init").then(({ initNativeShell }) =>
      initNativeShell()
    );
  }, []);

  return null;
}
