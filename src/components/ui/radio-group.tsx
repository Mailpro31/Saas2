"use client";

import * as React from "react";
import { CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Self-contained RadioGroup implementation.
 *
 * The canonical shadcn/ui RadioGroup wraps `@radix-ui/react-radio-group`, but
 * that package (and its roving-focus / collection internals) is not installed
 * in this project. To avoid adding a dependency, this provides an accessible
 * equivalent built on native ARIA radio semantics with roving tabindex and
 * arrow-key navigation. The public API (`value`, `defaultValue`,
 * `onValueChange`, `disabled`, `name` on the group; `value` on the item)
 * mirrors the Radix one, so swapping back later is trivial.
 */

type RadioGroupContextValue = {
  value: string | undefined;
  disabled?: boolean;
  name?: string;
  onSelect: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null
);

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
}

type RadioGroupProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
};

function RadioGroup({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  name,
  ...props
}: RadioGroupProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue
  );
  const value = isControlled ? valueProp : internalValue;

  const onSelect = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const contextValue = React.useMemo<RadioGroupContextValue>(
    () => ({ value, disabled, name, onSelect }),
    [value, disabled, name, onSelect]
  );

  const rootRef = React.useRef<HTMLDivElement>(null);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const navigationKeys = [
        "ArrowDown",
        "ArrowRight",
        "ArrowUp",
        "ArrowLeft",
      ];
      if (!navigationKeys.includes(event.key)) return;
      const root = rootRef.current;
      if (!root) return;

      const items = Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          '[data-slot="radio-group-item"]:not([data-disabled])'
        )
      );
      if (items.length === 0) return;

      event.preventDefault();
      const currentIndex = items.indexOf(
        document.activeElement as HTMLButtonElement
      );
      const direction =
        event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + direction + items.length) % items.length;
      const nextItem = items[nextIndex];
      nextItem.focus();
      nextItem.click();
    },
    []
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        role="radiogroup"
        aria-required={props["aria-required"]}
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
        onKeyDown={onKeyDown}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = Omit<
  React.ComponentProps<"button">,
  "value" | "type"
> & {
  value: string;
};

function RadioGroupItem({
  className,
  value,
  disabled: itemDisabled,
  ...props
}: RadioGroupItemProps) {
  const context = useRadioGroupContext();
  const checked = context.value === value;
  const disabled = context.disabled || itemDisabled;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      data-slot="radio-group-item"
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      tabIndex={checked || context.value === undefined ? 0 : -1}
      onClick={() => {
        if (disabled) return;
        context.onSelect(value);
      }}
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {context.name ? (
        <input
          type="radio"
          aria-hidden
          tabIndex={-1}
          name={context.name}
          value={value}
          checked={checked}
          readOnly
          className="sr-only"
        />
      ) : null}
      <span
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {checked ? (
          <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        ) : null}
      </span>
    </button>
  );
}

export { RadioGroup, RadioGroupItem };
