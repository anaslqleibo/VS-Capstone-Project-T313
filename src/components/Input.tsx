import { useRef, useState, useEffect } from "react";
import Icon from '../assets/icons/Icons';
import { validateInput } from './utils/validateInput';

interface InputIconProps{
  type: string;
  placeholder?: string;
  size?: string;
  icon: string;
  validate?: boolean;
  showErrors?: boolean;
  error?: string;
  className?: string;
}

export function InputIcon({ type = "search", placeholder, size = "base", icon = "?", validate, showErrors, error, className, ...props } : InputIconProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const fontSize = "text-" + size;
  const typeProps = type.split(' ');
  const filled = typeProps.includes("filled");
  const right = typeProps.includes("right");

  const iconColorActive = filled ? "text-white" : "text-[color:var(--primary-color)]";
  const iconColor = filled ? "text-white" : "text-[color:var(--dark-grey)]";

  return (
    <div className="w-fit group">
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex ${right ? "flex-row-reverse" : "flex-row"} items-stretch w-50 gap-3 ${filled && right ? "pl-5" : filled ? "pr-5" : "px-5"} rounded-md border-[1.5px] text-sm !outline-none focus:ring-1 border-[color:var(--dark-grey)] transition-colors cursor-text overflow-hidden group-hover:border-[color:var(--hover-color)] has-focus:border-[color:var(--primary-color)] invalid:border-red-500 ${fontSize} ${className}`}>
        <div className={`${filled ? "bg-[color:var(--dark-grey)] px-4 group-hover:bg-[color:var(--hover-color)] group-has-focus:bg-[color:var(--primary-color)]" : "bg-transparent group-hover:text-[color:var(--hover-color)] group-has-focus:text-[color:var(--primary-color)]"} flex items-center justify-center transition-colors ${iconColor} group-hover:${iconColorActive} `}>
          <Icon
            id={type === "search" ? type : icon}
            className={`transition-colors }
              text-[1.3em]
            `}
            width="1em"
            height="1em" />
        </div>
        <input
          ref={inputRef}
          placeholder={placeholder}
          className={`p-0 outline-none w-full ${fontSize} my-4`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1 text-left">{error}</p>}
    </div>
  );
}

interface InputProps {
  id ?: string;
  name ?: string;
  label ?: string;
  type ?: string;
  required ?: boolean;
  value ?: string;
  onChange ?: (e : any) => void;
  placeholder ?: string;
  validate ?: boolean;
  minLength ?: number;
  maxLength ?: number;
  pattern ?: string;
  textarea ?: boolean;
  customValidate ?: Function;
  validateMode ?: "onSubmit" | "onBlur" | "onChange";
  externalTrigger ?: number;
  className ?: string;
}

function Input({
  id, name, label, type = "text", required = false, value, onChange, placeholder, validate = true, minLength, maxLength, pattern, textarea,
  customValidate, validateMode = "onSubmit", externalTrigger=0, className, ...props
} : InputProps) {

  const internalRef = useRef(null);
  const [internalValue, setInternalValue] = useState("");
  const controlled = typeof value !== "undefined" && typeof onChange === "function";
  const isControlled = value !== undefined;

  const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(e); // call parent handler if present

    if (validateMode === "onChange" && !touched) {
      setTouched(true);
    }

    if (validateMode === "onChange") {
      runValidation(newValue);
    }
  };

  const getCurrentValue = () => {
    if (textarea) return (controlled ? value : internalValue);
    return (controlled ? value : internalValue);
  };

  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const runValidation = (newValue?: string) => {
    if (!validate) return;
    const val = newValue ?? getCurrentValue();
    const err = validateInput({ value: val, required, minLength, maxLength, pattern, type, customValidate });
    setError(err || "");
  };

  useEffect(() => {
    if (validateMode === "onChange" && touched) {
      runValidation();
    }
  }, [value]);

  useEffect(() => {
    if (externalTrigger > 0) {
      setTouched(true);
      runValidation();
    }
  }, [externalTrigger]);

  const TextArea = (<textarea id={id || name} name={name} required={required}
        value={controlled ? value : internalValue}
        onChange={(e) => {
          controlled ? onChange?.(e) : handleChange(e)
        }}
        onBlur={() => {
          if (validateMode === "onBlur") {
            setTouched(true);
            runValidation();
          }
        }}
        placeholder={placeholder}
        className={`w-full rounded-md border-[1.5px] px-3 py-2 text-sm !outline-none border-[color:var(--dark-grey)] transition-colors min-h-fit
          ${error && touched ? "border-red-500 ring-red-200" :
          " hover:border-[color:var(--hover-color)] hover:border-[1.5px] focus:border-[color:var(--primary-color)] "}  
        `}
        {...props}
      ></textarea>);

  const Text = (<input id={id || name} name={name} type={type} required={required} ref={internalRef}
          value={controlled ? value : internalValue}
          onChange={(e) => {
            controlled ? onChange?.(e) : handleChange(e)
          }}
          onBlur={() => {
            if (validateMode === "onBlur") {
              setTouched(true);
              runValidation();
            }
          }}
          placeholder={placeholder}
          className={`w-full rounded-md border-[1.5px] px-3 py-2 text-sm !outline-none border-[color:var(--dark-grey)] transition-colors
            ${error && touched ? "border-red-500 ring-red-200" :
            " hover:border-[color:var(--hover-color)] hover:border-[1.5px] focus:border-[color:var(--primary-color)] "}  
          `}
          {...props}
        />);

  return (
    <div className={`flex flex-col gap-1 ${className} group`}>
      {label && (
        <label htmlFor={id || name} className={`text-sm font-medium text-left group-has-focus:text-[color:var(--primary-color)] ${required && "after:ml-0.5 after:text-red-500 after:content-['*']"}`}>
          {label}
        </label>
      )}
      {textarea ? TextArea : Text
      }
      {error && touched && (
        <p className="text-left text-xs text-[color:var(--danger-color)]">{error}</p>
      )}
    </div>
  );
}

export default Input;
