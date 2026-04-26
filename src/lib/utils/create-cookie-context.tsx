"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { setCookie, getTypedCookie } from "./cookie-manager";

export type CookieContextConfig<T> = {
  cookieName: string;
  defaultValue: T;
  supportedValues: readonly T[];
  validator: (value: unknown) => value is T;
  applyEffect?: (value: T) => void;
  maxAgeDays?: number;
};

export type CookieContextValue<T> = {
  value: T;
  setValue: (value: T) => void;
};

export function createCookieContext<T extends string>(
  config: CookieContextConfig<T>
) {
  const {
    cookieName,
    defaultValue,
    supportedValues,
    validator,
    applyEffect,
    maxAgeDays = 365,
  } = config;

  const Context = createContext<CookieContextValue<T> | undefined>(undefined);

  let currentValue: T = defaultValue;
  const listeners = new Set<() => void>();

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): T {
    return currentValue;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function setValueInternal(value: T) {
    if (supportedValues.includes(value)) {
      currentValue = value;
      setCookie(cookieName, value, { maxAgeDays });
      applyEffect?.(value);
      listeners.forEach((listener) => listener());
    }
  }

  function Provider({ children }: { children: ReactNode }) {
    const syncedValue = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );

    useEffect(() => {
      const savedValue = getTypedCookie(cookieName, validator, defaultValue);
      if (savedValue !== currentValue) {
        setValueInternal(savedValue);
      }
      applyEffect?.(savedValue);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const setValue = useCallback((value: T) => {
      setValueInternal(value);
    }, []);

    const contextValue = useMemo(
      () => ({ value: syncedValue, setValue }),
      [syncedValue, setValue]
    );

    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  }

  function useValue(): CookieContextValue<T> {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(
        `use${cookieName} must be used within a ${cookieName} Provider`
      );
    }
    return context;
  }

  return {
    Context,
    Provider,
    useValue,
  };
}
