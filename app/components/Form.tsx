"use client";
import { useState, cloneElement, isValidElement, Dispatch, SetStateAction, ReactNode, ReactElement } from "react";
import { validateInput } from "./utils/validateInput";
import React from "react";

interface FormProps {
  children: React.ReactNode;
  onSubmit: ((e : React.FormEvent<HTMLFormElement>, f:any) => string) | ((e : React.FormEvent<HTMLFormElement>, f:any) => Promise<void>);
  onSubmitError?: ()=>void;
  scrollToError?: boolean;
  showToast?:Dispatch<SetStateAction<boolean>>;
  setToastMessage?:Dispatch<SetStateAction<string>>;
  className?: string;
  showAllErrorOnToast?: boolean;
}
interface ValidatableProps {
  value?: string;
  validate?: (value?: string) => string | null;
  customValidate?: (value: string) => string | null;
  [key: string]: any;
}


function Form({ children, onSubmit, scrollToError = true, className, showAllErrorOnToast=false, ...props } : FormProps) {
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [externalTrigger, setExternalTrigger] = useState(0);
  const childArray : { element: ReactNode; ref: React.RefObject<any> }[] = [];

  // Validate one child, returns error string or null
  const validateChild = (child : React.ReactNode, value: string) => {
    let errorMsg = "";

    if (isValidElement<ValidatableProps>(child)) {
      const props = child.props;

      if (typeof props.customValidate === "function") {
        errorMsg+= props.customValidate(value ?? "") || "";
      }

      if (typeof props.validate === "function") {
        errorMsg += props.validate(value ?? "") || "";
      } else{
        errorMsg += validateInput({...props, value}) || "";
      }

      return errorMsg===""?null:errorMsg;
    };
  }

  const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExternalTrigger(prev => prev + 1);

    // Validate all children with validate function
    const newErrors:string[] = [];
    const formDataCollector: Record<string, any> = {};

    childArray.forEach(({ element, ref }, index) => {
      if (ref?.current) {
        const name = ref.current.getName?.();
        const value = ref.current.getValue?.();
        if (name) formDataCollector[name] = value;

        const error = validateChild(element, value);
        if (error) newErrors.push(error);
      }
    });

    setErrors(newErrors);

    // let errorOnSubmit = '';
    if (newErrors.length === 0) {
      setExternalTrigger(0); // reset trigger after submit
      setExternalTrigger(1); // set the trigger to remove any error message on each input
      // errorOnSubmit = onSubmit?.(e);
      
      onSubmit?.(e, formDataCollector);

    } else if (scrollToError) {
      // Scroll to first error input
      props.onSubmitError?.();
      const firstInvalid = document.querySelector("[data-error-index]");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      }
    }
    
    // if (((newErrors[0] && newErrors[0] !== '' && showAllErrorOnToast) || errorOnSubmit!=='') && (props.showToast && props.setToastMessage)){
    //   props.setToastMessage(errorOnSubmit!==''?errorOnSubmit:newErrors[0]);
    //   props.showToast(true);
    // }
  };

  function isInputLike(child: any): boolean {
  if (!child || typeof child !== "object" || !("type" in child)) return false;

  const type = child.type;


  // Custom components
  const compName = type.displayName || type.name;
  return ["Input", "Textarea", "Select", "Dropdown"].includes(compName);
}

  function enhanceChildren(
  children: ReactNode,
  errors: Record<number, any>,
  parentIndex: number | null = null
  ): ReactNode {
    return React.Children.map(children, (child, index) => {
      if (!isValidElement(child)) return child;

      const el = child as ReactElement<any>;
      const currentIndex = parentIndex !== null ? parentIndex : index;

      // Detect input-like components
     
      if (isInputLike(el)) {
        const inputRef = React.createRef<any>();

        childArray.push({ element: el, ref: inputRef });

        const error = errors[currentIndex] ?? null;
        return cloneElement(el, {
          key: currentIndex,
          ref: inputRef,
          error,
          "data-error-index": error ? currentIndex : undefined,
          externalTrigger: externalTrigger
        });
      }

      // Recurse into nested children if they exist
      if (el.props.children) {
        return cloneElement(el, {
          key: currentIndex,
          children: enhanceChildren(el.props.children, errors, currentIndex),
        });
      }

      return el;
    });
  }
  const enhancedChildren = enhanceChildren(children, errors);


  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <div className="flex flex-col gap-4">{enhancedChildren}</div>
    </form>
  );
}



export default Form;
