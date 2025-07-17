import { useState, cloneElement, isValidElement } from "react";
import { validateInput } from "./utils/validateInput";

interface FormProps {
  children: React.ReactNode;
  onSubmit: Function;
  scrollToError?: boolean;
}
interface ValidatableProps {
  value?: string;
  validate?: (value?: string) => string | null;
  customValidate?: (value: string) => string | null;
  [key: string]: any;
}


function Form({ children, onSubmit, scrollToError = true } : FormProps) {
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [externalTrigger, setExternalTrigger] = useState(0);
  const childArray = Array.isArray(children) ? children : [children];

  // Validate one child, returns error string or null
  const validateChild = (child : React.ReactNode) => {
    let errorMsg = "";

    if (isValidElement<ValidatableProps>(child)) {
      const props = child.props;

      if (typeof props.customValidate === "function") {
        errorMsg+= props.customValidate(child.props.value ?? "") || "";
      }

      if (typeof props.validate === "function") {
        errorMsg += props.validate(child.props.value ?? "") || "";
      } else{
        errorMsg += validateInput(props) || "";
      }

      return errorMsg===""?null:errorMsg;
    };
  }

  const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExternalTrigger(prev => prev + 1);

    // Validate all children with validate function
    const newErrors: { [key: number]: string } = {};
    childArray.forEach((child, index) => {
      const error = validateChild(child);
      if (error) newErrors[index] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // No errors - submit allowed
      setExternalTrigger(0); // reset trigger after submit
      onSubmit?.(e);
    } else if (scrollToError) {
      // Scroll to first error input
      const firstInvalid = document.querySelector("[data-error-index]");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      }
    }
  };

  const enhancedChildren = childArray.map((child, index) => {
    if (!child || typeof child !== "object") return child;

    const error = errors[index] ?? null;

    return cloneElement(child, {
      key: index,
      error,
      "data-error-index": error ? index : undefined,
      externalTrigger: externalTrigger
    });
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">{enhancedChildren}</div>
    </form>
  );
}



export default Form;
