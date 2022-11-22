import { useRef } from "react";

export default function useSmartRef<T>(value: T) {
  const ref = useRef<T>(value);

  return ref;
}
