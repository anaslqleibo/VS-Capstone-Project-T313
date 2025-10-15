"use client";
import { useRef, useState, useEffect, SetStateAction, Dispatch, forwardRef, useImperativeHandle } from "react";
import Icon from '@/public/icons/Icons';
import { validateInput } from './utils/validateInput';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { formatToSqlDate } from "./utils/formatDate";

interface InputIconProps{
  type: string;
  placeholder?: string;
  size?: string;
  icon: string;
  className?: string;
  value?: string;
  onChange?: (e:any) => void;
  readOnly?:boolean;
  htmlType?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date';
}

export function InputIcon({ type = "search", placeholder, size = "base", icon = "?", className, value, onChange, readOnly, htmlType, ...props } : InputIconProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const fontSize = "text-" + size;
  const typeProps = type.split(' ');
  const filled = typeProps.includes("filled");
  const right = typeProps.includes("right");

  const iconColorActive = filled ? "text-white" : "text-[color:var(--primary-color)]";
  const iconColor = filled ? "text-white" : "text-[color:var(--dark-grey)]";

  return (
    <div onClick={() => inputRef.current?.focus()} className={`flex ${right ? "flex-row-reverse" : "flex-row"} items-stretch gap-3 ${filled && right ? "pl-2" : filled ? "pr-2" : "px-2"} rounded-md border-[1.5px] text-sm !outline-none focus:ring-1 ${readOnly ? 'border-primary' : 'border-dark-grey group-hover:border-hover'} transition-colors cursor-text overflow-hidden  has-focus:border-primary invalid:border-danger ${fontSize} ${className}`}>
        <div className={`${filled ? `${readOnly ? "bg-primary" : "bg-dark-grey group-hover:bg-[color:var(--hover-color)]"} px-2  group-has-focus:bg-[color:var(--primary-color)]` : "bg-transparent group-has-focus:text-[color:var(--primary-color)]"} flex items-center justify-center transition-colors ${iconColor} group-hover:${iconColorActive} `}>
          <Icon
            id={type === "search" ? type : icon}
            className={`transition-colors`}
            width="1em"
            height="1em" />
        </div>
        {(value!==undefined && onChange) ? 
        <input
          value={value}
          onChange={onChange}
          ref={inputRef}
          placeholder={placeholder}
          className={`p-0 outline-none w-full ${fontSize} my-2`}
          {...props}
          readOnly={readOnly}
          type={htmlType?htmlType:'text'}
        />
        :
        <input
          ref={inputRef}
          placeholder={placeholder}
          className={`p-0 outline-none w-full ${fontSize} my-2`}
          {...props}
          readOnly={readOnly}
          type={htmlType?htmlType:'text'}

        />
        }
      </div>
  );
}

interface InputProps {
  id ?: string;
  name ?: string;
  label ?: string;
  type?: string;
  required ?: boolean;
  value ?: string | number;
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
  allowViewPassword ?: boolean;
  arrow ?: 'leftRight' | 'topBottom';
  readonly?: boolean;
  setValue ?: (e:any) => void;
  containerClassName?:string;
  icon?:string;
  suggestionItems?:string[];
  onBlur?:()=>void;
  onFocus?:()=>void;
  min?: number;
  max?: number;
  step?: number;
  onKeyDown?: (e:React.KeyboardEvent)=>void;
}


const Input = forwardRef(function Input(
  {
    id, name, label, type = "text", required = false, value, onChange, placeholder,
    validate = true, minLength, maxLength, pattern, textarea, customValidate,
    validateMode = "onSubmit", externalTrigger=0, className, suggestionItems, onBlur, onFocus, min, max, step, onKeyDown, ...props
  }: InputProps,
  ref
) {
 

  const internalRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value??'');
  const controlled = value !== undefined && (typeof onChange === "function" || typeof props.setValue === "function"); 
  const [isPasswordShown, setPasswordShown] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (isPasswordShown ? "text" : "password") : type;


  useImperativeHandle(ref, () => ({
    getValue: () => (controlled ? value : internalValue),
    getName: () => name || id
  }));

  const [showSuggestion, setShowSuggestion] = useState(false);


  const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement> | string) => {
    if (typeof e !== "string"){
      const newValue = e.target.value;

      if (!controlled) {
        setInternalValue(newValue);
      }

      onChange?.(e); // call parent handler if present

      if (validateMode === "onChange" && !touched) {
        setTouched(true);
      }

      if (validateMode === "onChange") {
        runValidation(newValue);
      }
    }
    else{
      const event = {target: {name, value: e}}; 
      onChange?.(event);

      if (!controlled && type === 'date') {
        setInternalValue(formatToSqlDate(e));
      }
      else setInternalValue(e);
    }
  };

  const getCurrentValue = () => {
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
        value={controlled ? (value??'') : (internalValue??'')}
          onChange={(e) => {
            handleChange(e)
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
          " hover:border-[color:var(--hover-color)] hover:border-[1.5px] focus:border-[color:var(--primary-color)]"}  

          ${className ? className : ""}
        `}
        // {...props}
        disabled={props.readonly}
      ></textarea>);

  const Text = (
  <div className="relative">
    {type === "date" ? 
    <DatePicker format="DD-MM-YYYY" className="w-full" name={name} value={controlled ? dayjs(value) : dayjs(internalValue)} 
    onChange={(e) => {
      handleChange(e?.format("DD-MM-YYYY")??'');
    }}
    onOpen={() => {
      if (validateMode === "onBlur") {
        setTouched(true);
        runValidation();
      }
    }}
     slotProps={{
      textField: {
        variant: "standard",
        InputProps: {
          disableUnderline: true,
          className: `w-full rounded-md border-[1.5px] text-sm !outline-none 
            border-dark-grey transition-colors
            hover:border-hover hover:border-[1.5px] 
            focus:border-primary`,
          sx: {
            "& .MuiPickersSectionList-root": {
              px: "0.5rem",        
              py: "0.5rem",         
              fontSize: "0.875rem"
            },
          },
        },
      }
    }}/> :
    <>
    <input id={id || name} name={name} type={inputType} min={min} max={max} step={step} required={required} ref={internalRef}
          value={controlled ? (value??'') : (internalValue??'')}
          onChange={(e) => {
            handleChange(e)
          }}
          onBlur={() => {
            if (suggestionItems) {
              setTimeout(()=>setShowSuggestion(false), 100);
            }
            
            onBlur?.();

            if (validateMode === "onBlur") {
              setTouched(true);
              runValidation();
            }
          }}
          onKeyDown={onKeyDown}
          onFocus={()=>{onFocus?.(); if(suggestionItems) {setShowSuggestion(true);} }}
          placeholder={placeholder}
          className={`${props.arrow ? "w-20" : "w-full"} rounded-md ${className?.includes('border-') ? "" : "border-[1.5px]"} ${className?.includes('p-') || className?.includes('px-') || className?.includes('py-') ? "" : "px-3 py-2"}  ${props.arrow ? "text-lg" : "text-sm"} !outline-none border-[color:var(--dark-grey)] transition-colors
            ${error && touched ? "border-red-500 ring-red-200 " :
            `${props.readonly ? "" : "hover:border-[color:var(--hover-color)] hover:border-[1.5px] focus:border-[color:var(--primary-color)]"}`}  
            ${props.arrow ? 'border-none text-center font-semibold':""}
            
            ${className ? className : ""}
            `}
          disabled={props.readonly}
          // {...props}
      />

      {props.allowViewPassword &&
        (isPasswordShown ? <FaEyeSlash className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-[color:var(--primary-color)]" onClick={()=>{setPasswordShown(false)}}/> : <FaEye className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-[color:var(--primary-color)]" onClick={()=>{setPasswordShown(true)} }/>)
      }


      </>
    }
    
        {showSuggestion && suggestionItems && suggestionItems.length > 0 && (
        <ul className="absolute bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg z-50 text-sm" >
          {suggestionItems.map((s, idx) => (
            <li key={idx}
              onClick={() => handleChange(s)}
              className="p-2 hover:bg-gray-200 cursor-pointer">
              {s}
            </li>
          ))}
        </ul>
      )}
  </div>
  
  );

  const TextIcon = (
    <InputIcon
      type={type} 
      placeholder={placeholder}
      value={controlled ? (value?value.toString():'') : (internalValue?internalValue.toString():'')}
      onChange={(e: any) => handleChange(e)}
      readOnly={props.readonly}
      className={className}
      icon={props.icon?props.icon:'?'}
    />
  );

  
  return (
    <div className={`flex flex-col gap-1 group ${props.containerClassName?props.containerClassName:""} ${props.arrow ? "flex-row items-center":""}`}>
      {label && (
        <label htmlFor={id || name} className={`text-sm font-medium text-left group-has-focus:text-[color:var(--primary-color)] ${required && "after:ml-0.5 after:text-red-500 after:content-['*']"}`}>
          {label}
        </label>
      )}

      {props.arrow && <Icon id='arrow-left' className="hover:text-[color:var(--hover-color)]" onClick={()=>{props.setValue && typeof value === 'number' && props.setValue(value-1)}} />}

      {textarea ? TextArea : type?.includes("icon") ? TextIcon : Text}

      {props.arrow && <Icon id='arrow-right' className="hover:text-[color:var(--hover-color)]"
      onClick={()=>{props.setValue && typeof value === 'number' && props.setValue(value+1)}} />}

      {error && touched && (
        <p className="text-left text-xs text-[color:var(--danger-color)]">{error}</p>
      )}

     
    </div>
  );
});

Input.displayName = "Input";
InputIcon.displayName = "InputIcon";
export default Input;
