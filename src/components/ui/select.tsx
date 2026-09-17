"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  /** Rendered before the label in both the trigger and the list. */
  icon?: ReactNode;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** When set, the current value is mirrored into a hidden input for forms. */
  name?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  /** Renders the trigger borderless, for use inside a toolbar. */
  invalid?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * Accessible listbox replacing the native `<select>`, which cannot be styled
 * consistently across platforms and looks out of place in a designed UI.
 *
 * Implements the APG listbox pattern: roving `aria-activedescendant`, type-ahead,
 * Home/End/Arrow navigation, Escape to dismiss, and focus returned to the
 * trigger on close. Uncontrolled by default; pass `value` to control it.
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  placeholder = "Select…",
  id,
  className,
  invalid,
  disabled,
  "aria-label": ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;

  const [internal, setInternal] = useState(defaultValue ?? "");
  const selected = value ?? internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeAhead = useRef({ query: "", timer: 0 });

  const selectedIndex = options.findIndex((option) => option.value === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const commit = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [onChange, value],
  );

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  // Dismiss on outside pointer down and on scroll of an ancestor, both of
  // which would otherwise leave the menu floating away from its trigger.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // Keep the highlighted option in view during keyboard navigation.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openMenu(startIndex = selectedIndex >= 0 ? selectedIndex : 0) {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(startIndex);
  }

  function select(index: number) {
    const option = options[index];
    if (!option) return;
    commit(option.value);
    close();
    triggerRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) return openMenu();
        return setActiveIndex((prev) => Math.min(options.length - 1, prev + 1));

      case "ArrowUp":
        event.preventDefault();
        if (!open) return openMenu();
        return setActiveIndex((prev) => Math.max(0, prev - 1));

      case "Home":
        if (!open) return;
        event.preventDefault();
        return setActiveIndex(0);

      case "End":
        if (!open) return;
        event.preventDefault();
        return setActiveIndex(options.length - 1);

      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) return openMenu();
        return select(activeIndex);

      case "Escape":
        if (!open) return;
        event.preventDefault();
        close();
        return triggerRef.current?.focus();

      case "Tab":
        if (open) close();
        return;

      default:
        break;
    }

    // Type-ahead: printable characters jump to the first matching label.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      const state = typeAhead.current;
      window.clearTimeout(state.timer);
      state.query += event.key.toLowerCase();
      state.timer = window.setTimeout(() => {
        state.query = "";
      }, 600);

      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(state.query),
      );

      if (match >= 0) {
        if (open) setActiveIndex(match);
        else commit(options[match].value);
      }
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={selected} /> : null}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3.5 py-2.5 text-left text-sm transition outline-none",
          "hover:border-hairline-strong focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25",
          invalid ? "border-red-500/60" : "border-hairline",
          disabled && "cursor-not-allowed opacity-60",
          selectedOption ? "text-ink" : "text-ink-subtle",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-subtle transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            tabIndex={-1}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="panel-blur absolute z-50 mt-1.5 max-h-64 w-full min-w-full overflow-y-auto rounded-lg p-1 shadow-popover"
          >
            {options.map((option, index) => {
              const isSelected = option.value === selected;
              const isActive = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => select(index)}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    isActive ? "bg-surface-raised text-ink" : "text-ink-muted",
                  )}
                >
                  {option.icon ? (
                    <span className="mt-0.5 shrink-0">{option.icon}</span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.description ? (
                      <span className="mt-0.5 block text-xs text-ink-subtle">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                  ) : null}
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
