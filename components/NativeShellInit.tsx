"use client";

import { useEffect } from "react";
import { initNativeShell } from "@/mobile/native/init";

export default function NativeShellInit() {
  useEffect(() => {
    void initNativeShell();
  }, []);

  return null;
}
