import './Input.css';
import { useRef, useState, useEffect } from "react";
import Icon from '../assets/icons/Icons';

export function InputIcon({ type = "search", placeholder, size = "base", icon = "?", validate, showErrors, error, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const fontSize = "text-" + size;
  const typeProps = type.split(' ');
  const filled = typeProps.includes("filled");
  const right = typeProps.includes("right");

  const iconColorActive = filled ? "text-white" : "text-[color:var(--primary-color)]";
  const iconColor = filled ? "text-white" : "text-[color:var(--dark-grey)]";

  return (
    <div className="w-fit">
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-row${right ? "-reverse" : ""} items-stretch w-50 gap-3 ${filled && right ? "pl-5" : filled ? "pr-5" : "px-5"} rounded-xl border-2 border-solid transition-colors cursor-text overflow-hidden ${fontSize}
          ${isFocused ? "border-[color:var(--primary-color)]" : error ? "border-red-500" : "border-[color:var(--dark-grey)]"}
        `}>

        <div className={`${filled ? "bg-[color:var(--primary-color)] px-4" : "bg-transparent"} flex items-center justify-center`}>
          <Icon
            id={type === "search" ? type : icon}
            className={`transition-colors 
              ${isFocused ? iconColorActive : iconColor}
              text-[1.3em]
            `}
            width="1em"
            height="1em" />
        </div>

        <input
          ref={inputRef}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`p-0 outline-none w-full ${fontSize} my-4`}
          {...props}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-1 text-left">{error}</p>}
    </div>
  );
}

export function validateInput({
  value,
  required,
  minLength,
  maxLength,
  pattern,
  type,
  customValidate,
}) {
  if (required && !value) {
    return "This field is required.";
  }
  if (minLength && value.length < minLength) {
    return `Minimum length is ${minLength} characters.`;
  }
  if (maxLength && value.length > maxLength) {
    return `Maximum length is ${maxLength} characters.`;
  }
  if (pattern && !new RegExp(pattern).test(value)) {
    return "Invalid format.";
  }
  if (type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email address.";
  }
  if (typeof customValidate === "function") {
    return customValidate(value) || null;
  }
  return null;
}

function Input({
  id,
  name,
  label,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
  validate = true,
  minLength,
  maxLength,
  pattern,
  customValidate,   // additional custom validation by passing a function
  validateMode = "onBlur",
  externalTrigger = false,  // checks onSubmit trigger 
  ...props
}) {
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const runValidation = () => {
    if (!validate) return;

    const err = validateInput({
    value,
    required,
    minLength,
    maxLength,
    pattern,
    type,
    customValidate,
    });
    setError(err || "");  
  };

  // Run validation onChange if mode is "onChange"
  useEffect(() => {
    if (validateMode === "onChange" && touched) {
      runValidation();
    }
  }, [value]);

  // Run validation on external trigger (e.g. submit)
  useEffect(() => {
    if (validateMode === "onSubmit" && externalTrigger) {
      setTouched(true);
      runValidation();
    }
  }, [externalTrigger]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id || name} className="text-sm font-medium text-left">
          {label}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          if (validateMode === "onChange" && !touched) setTouched(true);
        }}
        onBlur={() => {
          if (validateMode === "onBlur") {
            setTouched(true);
            runValidation();
          }
        }}
        placeholder={placeholder}
        className={`
          "w-full rounded-md border px-3 py-2 text-sm !outline-none focus:ring-1 border-[color:var(--primary-color)]",
          ${error && touched? "border-red-500 ring-red-200" : "border-gray-300 hover:border-[color:var(--hover-color)] hover:border-1 focus:border-[color:var(--active-color)] "}  
        `}
        {...props}
      />
      {error && touched && <p className="text-left text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Input;
