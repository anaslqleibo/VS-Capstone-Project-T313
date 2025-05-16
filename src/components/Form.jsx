import { useState, cloneElement } from "react";
import { validateInput } from "./Input";

function Form({ children, onSubmit, scrollToError = true }) {
  const [errors, setErrors] = useState({});
  const [externalTrigger, setExternalTrigger] = useState(false);
  const childArray = Array.isArray(children) ? children : [children];

  // Validate one child, returns error string or null
  const validateChild = (child) => {
    if (typeof child.props.customValidate === "function") {
      return child.props.customValidate(child.props.value ?? "") || null;
    }
    return validateInput(child.props) || null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setExternalTrigger(true); // Tell Inputs to validate now

    // Validate all children with validate function
    const newErrors = {};
    childArray.forEach((child, index) => {
      const error = validateChild(child);
      if (error) newErrors[index] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // No errors - submit allowed
      setExternalTrigger(false); // reset trigger after submit
      onSubmit?.();
    } else if (scrollToError) {
      // Scroll to first error input
      const firstInvalid = document.querySelector("[data-error-index]");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus?.();
      }
    }
  };

  const enhancedChildren = childArray.map((child, index) => {
    if (!child || typeof child !== "object") return child;

    const error = errors[index] ?? null;

    return cloneElement(child, {
      key: index,
      error,
      showErrors: true,
      externalTrigger,
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
