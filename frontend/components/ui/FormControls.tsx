"use client";

import { useId, useRef, useState } from "react";
import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { CaretDown, MagnifyingGlass, Minus, Plus } from "@phosphor-icons/react";

type FieldProps = {
  className?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  label: string;
  optional?: boolean;
};

type FieldIds = {
  describedBy?: string;
  errorId: string;
  helperId: string;
  inputId: string;
};

function useFieldIds(id?: string): FieldIds {
  const generatedId = useId();
  const inputId = id ?? `field-${generatedId}`;

  return {
    inputId,
    helperId: `${inputId}-helper`,
    errorId: `${inputId}-error`,
  };
}

function describedBy(ids: FieldIds, helperText?: string, error?: string) {
  return [helperText ? ids.helperId : undefined, error ? ids.errorId : undefined].filter(Boolean).join(" ") || undefined;
}

function Field({
  children,
  className,
  error,
  helperText,
  hideLabel,
  ids,
  label,
  optional,
  required,
}: FieldProps & { children: ReactNode; ids: FieldIds; required?: boolean }) {
  return (
    <div className={`field${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <label className={hideLabel ? "sr-only" : "field__label"} htmlFor={ids.inputId}>
        {label}{required ? " (required)" : optional ? " (optional)" : ""}
      </label>
      {children}
      {helperText && <p className="field__helper" id={ids.helperId}>{helperText}</p>}
      {error && <p className="field__error" id={ids.errorId}>{error}</p>}
    </div>
  );
}

export type TextFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function TextField({
  className,
  error,
  helperText,
  hideLabel,
  id,
  label,
  optional,
  required,
  type = "text",
  ...props
}: TextFieldProps) {
  const ids = useFieldIds(id);

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <input
        aria-describedby={describedBy(ids, helperText, error)}
        aria-invalid={error ? true : undefined}
        className="control-input"
        id={ids.inputId}
        required={required}
        type={type}
        {...props}
      />
    </Field>
  );
}

export type SearchFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> & { clearLabel?: string };

export function SearchField({
  className,
  defaultValue,
  error,
  helperText,
  hideLabel,
  id,
  label,
  onChange,
  optional,
  required,
  clearLabel,
  value,
  ...props
}: SearchFieldProps) {
  const ids = useFieldIds(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
  const currentValue = isControlled ? String(value ?? "") : internalValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  }

  function clear() {
    const input = inputRef.current;
    if (!input) return;

    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <div className="control-input-wrap">
        <MagnifyingGlass aria-hidden="true" className="control-input__leading-icon" size={20} weight="bold" />
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          className="control-input control-input--with-leading-icon"
          defaultValue={isControlled ? undefined : defaultValue}
          id={ids.inputId}
          onChange={handleChange}
          ref={inputRef}
          required={required}
          type="search"
          value={isControlled ? value : undefined}
          {...props}
        />
        {currentValue && (
          <button aria-label={clearLabel ?? `Clear ${label}`} className="control-input__clear" onClick={clear} type="button">
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </Field>
  );
}

export type SelectOption = { disabled?: boolean; label: string; value: string };
export type SelectFieldProps = FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "className"> & {
  options: SelectOption[];
  placeholder?: string;
};

export function SelectField({
  className,
  error,
  helperText,
  hideLabel,
  id,
  label,
  optional,
  options,
  placeholder,
  required,
  ...props
}: SelectFieldProps) {
  const ids = useFieldIds(id);

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <div className="control-input-wrap">
        <select aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className="control-input control-select" id={ids.inputId} required={required} {...props}>
          {placeholder && <option disabled value="">{placeholder}</option>}
          {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <CaretDown aria-hidden="true" className="control-select__icon" size={20} weight="bold" />
      </div>
    </Field>
  );
}

export type DateFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">;

export function DateField({ className, error, helperText, hideLabel, id, label, optional, required, ...props }: DateFieldProps) {
  const ids = useFieldIds(id);

  return (
    <Field className={className} error={error} helperText={helperText} hideLabel={hideLabel} ids={ids} label={label} optional={optional} required={required}>
      <input aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className="control-input" id={ids.inputId} required={required} type="date" {...props} />
    </Field>
  );
}

export type ChoiceOption = { description?: ReactNode; disabled?: boolean; label: ReactNode; value: string };
type ChoiceGroupProps = FieldProps & { name: string; options: readonly ChoiceOption[]; required?: boolean };

function ChoiceMessages({ error, helperText, ids }: Pick<FieldProps, "error" | "helperText"> & { ids: FieldIds }) {
  return <>{helperText && <p className="field__helper" id={ids.helperId}>{helperText}</p>}{error && <p className="field__error" id={ids.errorId}>{error}</p>}</>;
}

export type RadioGroupProps = ChoiceGroupProps & { defaultValue?: string; onValueChange?: (value: string) => void; value?: string };

export function RadioGroup({ className, defaultValue, error, helperText, label, name, onValueChange, options, required, value }: RadioGroupProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field choice-group${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (required)" : ""}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <label className="choice-option" key={option.value}>
            <input
              {...(isControlled ? { checked: value === option.value } : { defaultChecked: defaultValue === option.value })}
              disabled={option.disabled}
              name={name}
              onChange={() => onValueChange?.(option.value)}
              required={required}
              type="radio"
              value={option.value}
            />
            <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
          </label>
        ))}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type CheckboxGroupProps = ChoiceGroupProps & { defaultValue?: string[]; onValueChange?: (value: string[]) => void; value?: string[] };

export function CheckboxGroup({ className, defaultValue = [], error, helperText, label, name, onValueChange, options, required, value }: CheckboxGroupProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValues = isControlled ? value : internalValue;

  function toggle(optionValue: string, checked: boolean) {
    const next = checked ? [...selectedValues, optionValue] : selectedValues.filter((item) => item !== optionValue);
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field choice-group${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (required)" : ""}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <label className="choice-option" key={option.value}>
            <input checked={selectedValues.includes(option.value)} disabled={option.disabled} name={name} onChange={(event) => toggle(option.value, event.target.checked)} required={required} type="checkbox" value={option.value} />
            <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
          </label>
        ))}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type SegmentedControlProps = ChoiceGroupProps & { defaultValue?: string; onValueChange?: (value: string) => void; value?: string };

export function SegmentedControl({ className, defaultValue, error, helperText, label, name, onValueChange, options, required, value }: SegmentedControlProps) {
  const ids = useFieldIds();
  const isControlled = value !== undefined;

  return (
    <fieldset aria-describedby={describedBy(ids, helperText, error)} aria-invalid={error ? true : undefined} className={`field segmented-control${error ? " field--error" : ""}${className ? ` ${className}` : ""}`}>
      <legend className="field__label">{label}{required ? " (required)" : ""}</legend>
      <div className="segmented-control__options">
        {options.map((option) => (
          <label className="segmented-control__option" key={option.value}>
            <input
              {...(isControlled ? { checked: value === option.value } : { defaultChecked: defaultValue === option.value })}
              disabled={option.disabled}
              name={name}
              onChange={() => onValueChange?.(option.value)}
              required={required}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <ChoiceMessages error={error} helperText={helperText} ids={ids} />
    </fieldset>
  );
}

export type SliderProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "defaultValue" | "onChange" | "type" | "value"> & {
  defaultValue?: number;
  formatValue?: (value: number) => string;
  onValueChange?: (value: number) => void;
  value?: number;
};

export function Slider({ className, defaultValue = 0, error, formatValue = String, helperText, id, label, onValueChange, value, ...props }: SliderProps) {
  const ids = useFieldIds(id);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  return (
    <Field className={className} error={error} helperText={helperText} ids={ids} label={label}>
      <div className="slider">
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          aria-valuetext={formatValue(currentValue)}
          id={ids.inputId}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!isControlled) setInternalValue(next);
            onValueChange?.(next);
          }}
          type="range"
          value={currentValue}
          {...props}
        />
        <output aria-live="off">{formatValue(currentValue)}</output>
      </div>
    </Field>
  );
}

export type StepperProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "defaultValue" | "onChange" | "type" | "value"> & {
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  value?: number;
};

function decimalPlaces(value: number) {
  return value.toString().split(".")[1]?.length ?? 0;
}

export function Stepper({ className, defaultValue = 0, disabled, error, helperText, id, label, max, min = 0, onValueChange, readOnly, required, step = 1, value, ...props }: StepperProps) {
  const ids = useFieldIds(id);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : defaultValue;
  const [internalValue, setInternalValue] = useState(currentValue);
  const [textState, setTextState] = useState({ forValue: currentValue, text: String(currentValue) });
  const displayedValue = isControlled ? value : internalValue;
  const textValue = textState.forValue === displayedValue ? textState.text : String(displayedValue);
  const increment = Number(step);
  const minimum = Number(min);
  const maximum = max === undefined ? Number.POSITIVE_INFINITY : Number(max);

  function normalize(next: number) {
    const clamped = Math.min(Math.max(next, minimum), maximum);
    const snapped = minimum + Math.round((clamped - minimum) / increment) * increment;
    return Number(Math.min(Math.max(snapped, minimum), maximum).toFixed(Math.max(decimalPlaces(increment), decimalPlaces(minimum))));
  }

  function commit(next: number) {
    const normalized = normalize(next);
    if (!isControlled) setInternalValue(normalized);
    setTextState({ forValue: normalized, text: String(normalized) });
    onValueChange?.(normalized);
  }

  function commitText() {
    const parsed = Number(textValue);
    if (Number.isFinite(parsed)) commit(parsed);
    else setTextState({ forValue: displayedValue, text: String(displayedValue) });
  }

  const cannotDecrease = disabled || readOnly || displayedValue <= minimum;
  const cannotIncrease = disabled || readOnly || displayedValue >= maximum;

  return (
    <Field className={className} error={error} helperText={helperText} ids={ids} label={label} required={required}>
      <div className="stepper">
        <button aria-label={`Decrease ${label}`} className="stepper__button" disabled={cannotDecrease} onClick={() => commit(displayedValue - increment)} type="button"><Minus aria-hidden="true" size={18} weight="bold" /></button>
        <input
          aria-describedby={describedBy(ids, helperText, error)}
          aria-invalid={error ? true : undefined}
          aria-label={label}
          className="stepper__input"
          disabled={disabled}
          id={ids.inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onBlur={commitText}
          onChange={(event) => setTextState({ forValue: displayedValue, text: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          readOnly={readOnly}
          required={required}
          step={step}
          type="number"
          value={textValue}
          {...props}
        />
        <button aria-label={`Increase ${label}`} className="stepper__button" disabled={cannotIncrease} onClick={() => commit(displayedValue + increment)} type="button"><Plus aria-hidden="true" size={18} weight="bold" /></button>
      </div>
    </Field>
  );
}
