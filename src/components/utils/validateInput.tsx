interface ParamTypes {
  value?: string | number;
  required?: boolean | undefined;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  type?: string;
  customValidate?: Function;
}

export function validateInput({ value="", required, minLength, maxLength, pattern, type, customValidate } : ParamTypes) {
  if (required && !value) {
    return "This field is required.";
  }

  if (typeof value === 'string'){
    if (minLength && value.length < minLength) {
    return `Minimum length is ${minLength} characters.`;
    }
    if (maxLength && value.length > maxLength) {
      return `Maximum length is ${maxLength} characters.`;
    }
    if (pattern && !new RegExp(pattern).test(value)) {
      return "Invalid format.";
    }
    if (type === "email" && value && value!="") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address.";
      }
    }
  }
  
  if (typeof customValidate === "function") {
    return customValidate(value) || null;
  }
  return null;
}