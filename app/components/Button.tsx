"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import Icon from '@/public/icons/Icons';

interface ToggleProps {
    size?:string;
    onClick?: { true: () => void; false: () => void }; 
    disabled?: boolean; 
    children ?: React.ReactNode;
    className ?: string;

    // controlled props
    checked ?: boolean;
    onChange?: (() => void);
}

/**
 * A custom button component with a checkmark icon that switches between 'true' or 'false' state
 * @param size Set the icon's size, e.g., 1em 
 * @param onClick Takes in a function in the form of { true: () => void; false: () => void }, where the key 'true' will be called when the button is 'selected' and key 'false' gets called when it becomes 'unselected'
 * @param disabled If true, will disable the component
 * @param children ReactNode placed before the checkmark icon
 * @param className Set the class names for the component
 */
export function Toggle({size = '0.6em', onClick, className, checked, onChange, ...props} : ToggleProps){
    let validSize = size;
    if (validSize && !validSize.endsWith('em'))
        validSize += 'em';
    
    const [active, setActive] = useState(false);

    function onToggleClick(){
        setActive(!active)
        if (onClick && onClick.true && onClick.false) {
            if (!active && typeof onClick.true === 'function') {
                onClick.true();
            } else if (active && typeof onClick.false === 'function') {
                onClick.false();
            }
        }
    }       

    return (
            <div className={`flex flex-row items-center gap-2 ${className}`}>
            {props.children}
            <div className={`relative w-[4.8em] h-[2.4em] rounded-full bg-[color:var(--light-grey)] transition-colors duration-200 cursor-pointer text-[color:var(--light-grey)] ${checked ||active ? 'bg-[color:var(--primary-color)] text-[color:var(--primary-color)] hover:bg-[color:var(--hover-color)] hover:text-[color:var(--hover-color)]' : 'hover:bg-[color:var(--dark-grey)] hover:text-[color:var(--dark-grey)]'} ${props.disabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''}`}
  
                onClick={onChange ? onChange : onToggleClick}
                aria-disabled={props.disabled}
                style={{ fontSize: validSize }}>
                <div className={`absolute top-[0.2em] left-[0.2em] w-[2em] h-[2em] rounded-full bg-white flex items-center justify-center transition-transform duration-200 ${checked || active ? 'translate-x-[2.4em]' : ''}`}>
                    <Icon id="checkmark" />
                </div>
            </div>
            </div>
            
        );
}

interface SelectableProps{
    onClick ?:{ true: () => void; false: () => void };  
    fontSize ?: string;
    disabled?:boolean;
    startActive?:boolean;
    children?: React.ReactNode;
    className?:string;
}

/**
 * A custom button component that switches between 'selected' or 'not selected' state indicated by the block background color
 * @param onClick Takes in a function in the form of { true: () => void; false: () => void }, where the key 'true' will be called when the button is 'selected' and key 'false' gets called when it becomes 'unselected'
 * @param fontSize Set the the text fontSize, e.g., 0.8em, 24px
 * @param startActive If true, will set the component state as 'selected' on initial launch
 * @param disabled If true, will disable the component
 * @param children The button's text in the form of string
 * @param className Set the class names for the button
 */
export function Selectable({onClick, fontSize, startActive, className, ...props} : SelectableProps){
    const [active, setActive] = useState(startActive??false);

    useEffect(()=>{
        if (startActive !== undefined) setActive(startActive);
    }, [startActive])

    function onToggleClick(){
        setActive(!active)
        if (onClick && onClick.true && onClick.false) {
            if (!active && typeof onClick.true === 'function') {
                onClick.true();
            } else if (active && typeof onClick.false === 'function') {
                onClick.false();
            }
        }
    }     

    return (<button onClick={onToggleClick} className={`${(className && className.includes('px-')) ? '' : 'px-[1.3em]'} ${(className && className.includes('py-')) ? '' : 'py-[0.8em]'} rounded-full border-1 transition-colors duration-200 hover:border-[color:var(--hover-color)] border-[color:var(--primary-color)] 
    ${active
      ? 'bg-[color:var(--primary-color)] font-semibold text-white hover:text-white hover:bg-[color:var(--hover-color)]'
      : 'bg-transparent text-[color:var(--primary-color)] hover:text-[color:var(--hover-color)] active:text-[color:var(--active-color)] active:border-[color:var(--active-color)]'}
    ${props.disabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''} ${className}`}
  disabled={props.disabled}
            style = {{fontSize}}>
                {props.children}
        </button>);
    
}

/**
 * 
 */
interface DropdownProps{
    fontSize ?: string;
    onItemClicks?: ((e: any) => void)[];
    items?: string[];
    actAsFilter ?: boolean;
    setFilter ?: Dispatch<SetStateAction<string>>;
    disabled ?: boolean;
    children?: React.ReactNode; 
}

/**
 * A custom button component that when clicked will display a child container with elements passed in 'items'
 * @param fontSize Sets the text font size, e.g., 0.8em, 24px
 * @param onItemClicks List of function to handle each item click. Length MUST be equal to the 'items' array's length
 * @param items List of elements displaying in the dropdown container in the form of strings
 * @param actAsFilter If true, when an item is clicked it will set that clicked item as the current selected item, acting as a filter mechanism 
 * @param setFilter Custom SetState string object to which will pass in the selected item string to the function
 * @param disabled If true, will disable the component
 * @param children A string that replaces the first text shown as the 'title' or selected item of the component, MUST be a string
 */
export function ButtonDropdown({fontSize, onItemClicks, items, actAsFilter = false, ...props} : DropdownProps){
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(props.children || "Add Task")
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative block" ref={dropdownRef}>
        <button
            className={`flex items-center gap-2 bg-[color:var(--secondary-color)] text-white px-[1.6em] py-[1em] rounded-md transition-colors duration-200
    ${open ? 'bg-[color:var(--active-color)]' : 'hover:bg-[color:var(--hover-color)]'}
    ${props.disabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : ''}`}  
            onClick={() => setOpen((prev) => !prev)}
            style={{fontSize}}
            disabled={props.disabled}>
            {text}

            <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="0.5em" viewBox="0 0 16 8" fill="none" style={{ verticalAlign: 'middle' }}>
                    <path d="M8 7.5L15.7942 0H0.205771L8 7.5Z" fill="currentColor" />
                </svg>  
            </span>
        </button>

        {open && (
            <div className="absolute top-[calc(100%+4px)] left-0 bg-white rounded-md shadow-lg z-[1000] min-w-[220px] overflow-hidden">
                {
                    items ? items.map((item, index) =>
                    <div className="px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-[color:var(--active-light-color)]" 
                    onClick={ () =>
                        {   onItemClicks?.[index]
                            if (actAsFilter) setText(item);
                            setOpen(false);
                            props.setFilter?.(item);
                        }}>
                        {item}
                    </div>) : 
                    <><div className="dropdown-item">Item 1</div>
                    <div className="dropdown-item">Item 2</div>
                    <div className="dropdown-item">Item 3</div>
                    <div className="dropdown-item">Please pass in 'items' attribute to change this</div></>
                }
            </div>
        )}
        </div>
    );
    
}

interface ButtonProps{
    type?: 'cta' | 'text' | 'outline' | 'toggle' | 'selectable' | 'dropdown' | 'icon' | 'icon outline' | 'fab';
    fontSize?:string;
    onClick?: (e:any) => (void) | void;
    onToggleClick?: { true: () => void; false: () => void }
    items?: string[];
    onItemClicks ?: ((e: any) => void)[];
    size?:string;
    htmlType?:"button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    className?: string;
    startActive?:boolean;
    children?:React.ReactNode;
}


/**
 * Custom button component
 * @param type Sets the type of custom button, e.g. cta, toggle, dropdown, etc
 * @param fontSize Sets the text font size, e.g., 1em
 * @param onClick Sets the function that gets called when the button is clicked
 * @param onToggleClick Exclusive parameter to pass in if the 'type' is set to 'toggle'
 * @param items Exclusive parameter to pass in if the 'type' is set to 'dropdown'
 * @param onItemClicks Exclusive parameter to pass in if the 'type' is set to 'dropdown'
 * @param size Exclusive parameter to pass in if the 'type' is set to 'toggle'
 * @param htmlType set the 'type' attribute of the button element
 * @param disabled If true, will disable the component
 * @param className Set the class names of the component
 * @param startActive Exclusive parameter to pass in if the 'type' is set to 'selectable'
 * @param children ReactNode placed inside the button element
 */
export default function Button({ type = 'cta', fontSize = '1em', onClick, items, onItemClicks, size, htmlType, disabled, children, ...props } : ButtonProps){
    

    // Toggle Button Setup
    if (type==="toggle"){
        return <Toggle onClick={props.onToggleClick} size={size} disabled={disabled} className={props.className}>{children}</Toggle>;
        
    }

    // Selectable Button Setup
    if (type==="selectable"){
        return <Selectable onClick={props.onToggleClick} fontSize={fontSize} disabled={disabled} startActive={props.startActive} className={props.className}>
            {children}
        </Selectable>;
    }

    // Dropdown Button Setup
    if (type === "dropdown") {
        return <ButtonDropdown onItemClicks={onItemClicks} fontSize={fontSize} items={items} disabled={disabled}>{children}</ButtonDropdown>;
    }

    // Icon Button Setup --> Size automatically fit the icon's size
    if (type.includes("icon"))
        return (
        <button onClick={onClick} className={`text-[#FFFFFF]
       p-2 rounded-xl bg-[color:var(--primary-color)] text-[0.75rem] transition-colors duration-200 hover:bg-[color:var(--hover-color)] active:bg-[color:var(--active-color)] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
        
        ${type.includes("outline") && "border-2 bg-white border-[color:var(--primary-color)] text-[color:var(--primary-color)] hover:border-[color:var(--hover-color)] hover:text-white active:border-[color:var(--active-color)] active:text-[color:var(--active-color)]"}
        ${props.className}
        `} disabled={disabled} type={htmlType || "button"} >
            {children}
        </button>);

    // General Button Setup
    return (
        <button onClick={onClick} className={`flex ${(!props.className?.includes('p-') && !props.className?.includes('py-') && !props.className?.includes('px-')) && 'px-6 py-4'} justify-center items-center gap-2.5 shrink-0 text-[#FFFFFF] text-center font-[family-name:var(--font-family)] font-normal border-0 outline-0
    ${type === 'cta' ? `rounded-xl font-semibold transition-colors duration-200 ${!props.className?.includes('bg-') && "bg-primary hover:bg-hover active:bg-active"}` : ""}
    ${type === 'text' ? 'rounded-[75px] px-6 bg-[#3259AD] hover:bg-hover active:bg-[#274689]' : ''}
    ${type === 'outline' ? 'px-[1.3em] py-[0.8em] rounded-xl border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white active:bg-transparent active:text-primary duration-200 ease-in' : ''}
    ${type === 'fab' ? "rounded-full bg-primary shadow-[0_5px_10px_rgba(0,0,0,0.25)] p-2 text-white text-[0.75rem] transition-colors duration-200 hover:bg-[color:var(--hover-color)] hover:border-[color:var(--hover-color)] hover:text-white active:bg-[color:var(--active-color)] active:border-[color:var(--active-color)] active:text-white disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed" : ''}
    ${props.className ? props.className : ''}
    ${disabled ? 'pointer-events-none opacity-50 cursor-not-allowed bg-gray-400' : ''}`} disabled={disabled}
        style = {{fontSize}} type={htmlType || "button"} >
            <div className='gap-[0.5em] flex items-center'>
                {children}
            </div>
            
        </button>
    );
}