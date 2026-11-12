"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled: boolean; group?: string };

type SelectProps = {
  value?: string | number;
  defaultValue?: string | number;
  /** Same shape as a native select: read `e.target.value`. */
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children?: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  title?: string;
  "aria-label"?: string;
};

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** Reads <option> and <optgroup> children, so call sites stay written like a native select. */
function readOptions(children: ReactNode, group?: string, out: Option[] = []): Option[] {
  Children.forEach(children, (child) => {
    if (!isValidElement<Record<string, unknown>>(child)) return;
    const props = child.props as { children?: ReactNode; value?: string | number; disabled?: boolean; label?: string };
    if (child.type === Fragment) {
      readOptions(props.children, group, out);
    } else if (child.type === "optgroup") {
      readOptions(props.children, props.label, out);
    } else if (child.type === "option") {
      const label = textOf(props.children);
      out.push({ value: String(props.value ?? label), label, disabled: !!props.disabled, group });
    }
  });
  return out;
}

const PHONE = "(max-width: 767px)";

/**
 * Drop-in replacement for <select>. Closed, it is a button that takes the same className.
 * Open, it is a bottom sheet on phones and a popover next to the button on larger screens,
 * so every dropdown looks and behaves the same on every device.
 */
export function Select({
  value,
  defaultValue,
  onChange,
  children,
  className,
  id,
  name,
  disabled,
  required,
  title,
  "aria-label": ariaLabel,
}: SelectProps) {
  const options = useMemo(() => readOptions(children), [children]);
  const [inner, setInner] = useState(() => String(defaultValue ?? ""));
  const controlled = value !== undefined;
  const raw = controlled ? String(value) : inner;
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === raw));
  const selected = options[selectedIndex];

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxHeight: number } | null>(null);
  const [heading, setHeading] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();

  const openMenu = useCallback(() => {
    if (disabled || !options.length) return;
    const button = buttonRef.current;
    if (!button) return;
    const isPhone = window.matchMedia(PHONE).matches;
    setPhone(isPhone);
    if (!isPhone) {
      const r = button.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - 12;
      const above = r.top - 12;
      const up = below < 220 && above > below;
      const width = Math.min(Math.max(r.width, 180), window.innerWidth - 16);
      setPos({
        left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
        width,
        top: up ? undefined : r.bottom + 6,
        bottom: up ? window.innerHeight - r.top + 6 : undefined,
        maxHeight: Math.max(160, Math.min(340, up ? above : below)),
      });
    }
    // Sheet title: the aria-label, else the <label> that points at this control.
    const near = button.labels?.[0] ?? button.parentElement?.querySelector("label") ?? button.parentElement?.parentElement?.querySelector(":scope > label");
    const label = ariaLabel || near?.textContent?.replace(/\*/g, "").trim() || title || "";
    setHeading(label.length > 60 ? "" : label);
    setActive(selectedIndex);
    setOpen(true);
  }, [ariaLabel, disabled, options.length, selectedIndex, title]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  const choose = useCallback(
    (option: Option) => {
      if (option.disabled) return;
      close();
      if (option.value === raw) return;
      if (!controlled) setInner(option.value);
      const target = { value: option.value, name: name ?? "", id: id ?? "" };
      onChange?.({ target, currentTarget: target } as unknown as ChangeEvent<HTMLSelectElement>);
    },
    [close, controlled, id, name, onChange, raw],
  );

  // Keep the highlighted row in view.
  useLayoutEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => close(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, close]);

  const move = (from: number, step: number) => {
    let i = from;
    for (let n = 0; n < options.length; n++) {
      i = (i + step + options.length) % options.length;
      if (!options[i].disabled) return i;
    }
    return from;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const k = e.key;
    if (!open) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (k === "Tab") {
      close(false);
    } else if (k === "ArrowDown") {
      e.preventDefault();
      setActive((a) => move(a, 1));
    } else if (k === "ArrowUp") {
      e.preventDefault();
      setActive((a) => move(a, -1));
    } else if (k === "Home") {
      e.preventDefault();
      setActive(move(-1, 1));
    } else if (k === "End") {
      e.preventDefault();
      setActive(move(options.length, -1));
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (k.length === 1) {
      const now = Date.now();
      const t = typed.current;
      t.text = (now - t.at > 700 ? "" : t.text) + k.toLowerCase();
      t.at = now;
      const hit = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  };

  const rows = options.map((o, i) => {
    const isSelected = i === selectedIndex;
    const showGroup = o.group && o.group !== options[i - 1]?.group;
    return (
      <Fragment key={`${o.value}-${i}`}>
        {showGroup && (
          <li role="presentation" className="px-4 pb-1 pt-3 text-xs font-semibold text-slate-500">
            {o.group}
          </li>
        )}
        <li
          id={`${listId}-${i}`}
          role="option"
          aria-selected={isSelected}
          aria-disabled={o.disabled || undefined}
          data-index={i}
          onClick={() => choose(o)}
          onMouseMove={() => !o.disabled && active !== i && setActive(i)}
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-left text-slate-800",
            phone ? "min-h-12 py-3 text-base" : "min-h-9 py-2 text-sm",
            i === active && "bg-slate-100",
            isSelected && "font-semibold text-brand-ocean",
            o.disabled && "cursor-not-allowed opacity-45",
          )}
        >
          <span className="min-w-0 break-words">{o.label || " "}</span>
          {isSelected && (
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m4.5 10.5 3.5 3.5 7.5-8" />
            </svg>
          )}
        </li>
      </Fragment>
    );
  });

  const list = (
    <ul
      ref={listRef}
      id={listId}
      role="listbox"
      aria-label={heading || undefined}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
    >
      {rows}
    </ul>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        title={title}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={cn("sa-select", className)}
      >
        <span className="flex w-full min-w-0 items-center justify-between gap-2">
          <span className="min-w-0 truncate">{selected?.label || " "}</span>
          <svg viewBox="0 0 20 20" className={cn("h-[1.05em] w-[1.05em] shrink-0 opacity-60 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5.5 7.5 10 12l4.5-4.5" />
          </svg>
        </span>
      </button>
      {name && <input type="hidden" name={name} value={selected?.value ?? ""} />}
      {open &&
        createPortal(
          // Clicks inside the picker must not reach rows or dialogs the control sits in.
          <div className="sa-overlay fixed inset-0 z-[1000]" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            {phone ? (
              <>
                <div className="absolute inset-0 bg-slate-900/50 sa-fade" onClick={() => close()} />
                <div className="sa-sheet absolute inset-x-0 bottom-0 flex max-h-[75dvh] flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <p className="min-w-0 truncate text-base font-semibold text-slate-900">{heading || "Choose one"}</p>
                    <button type="button" onClick={() => close()} className="-mr-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-ocean">
                      Close
                    </button>
                  </div>
                  {list}
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0" onClick={() => close()} />
                {pos && (
                  <div
                    className="sa-pop absolute flex flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
                    style={{ left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.width, maxWidth: "min(420px, calc(100vw - 16px))", maxHeight: pos.maxHeight }}
                  >
                    {list}
                  </div>
                )}
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
