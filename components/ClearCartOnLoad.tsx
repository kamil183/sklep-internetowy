"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartContext";

export default function ClearCartOnLoad() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
