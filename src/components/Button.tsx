import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import './Button.css';
import Icon from '../assets/icons/Icons';


interface ToggleProps {
    size?:string;
    onClick?: { true: () => void; false: () => void }; 
    disabled?: boolean; 
    children ?: React.ReactNode;
}

export function Toggle({size = '0.6em', onClick, ...props} : ToggleProps){
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
            <div className={`toggle ${active ? 'active' : ''} ${props.disabled && 'disabled'}`}
                onClick={onToggleClick}
                aria-disabled={props.disabled}
                style={{ fontSize: validSize }}>
                <div>
                    <Icon id="checkmark"/>
                </div>
            </div>
        );
}

interface SelectableProps{
    onClick ?:{ true: () => void; false: () => void };  
    fontSize ?: string;
    disabled?:boolean;
    children?: React.ReactNode;
}
export function Selectable({onClick, fontSize, ...props} : SelectableProps){
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

    return (<button onClick={onToggleClick} className={`selectable ${active ? 'active' : ''}`} disabled={props.disabled}
            style = {{fontSize}}>
                {props.children}
        </button>);
    
}

interface DropdownProps{
    fontSize ?: string;
    onItemClicks?: ((e: any) => void)[];
    items?: string[];
    actAsFilter ?: boolean;
    setFilter ?: Dispatch<SetStateAction<string>>;
    disabled ?: boolean;
    children?: React.ReactNode; 
}
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
        <div className="dropdown-container" ref={dropdownRef}>
        <button
            className={`dropdown-button ${open ? 'active' : ''}`}
            onClick={() => setOpen((prev) => !prev)}
            style={{fontSize}}
            disabled={props.disabled}>
            {text}

            <span className={`dropdown-icon ${open ? 'rotate' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="0.5em" viewBox="0 0 16 8" fill="none" style={{ verticalAlign: 'middle' }}>
                    <path d="M8 7.5L15.7942 0H0.205771L8 7.5Z" fill="currentColor" />
                </svg>  
            </span>
        </button>

        {open && (
            <div className="dropdown-menu">
                {
                    items ? items.map((item, index) =>
                    <div className="dropdown-item" 
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
    type?: 'cta' | 'toggle' | 'selectable' | 'dropdown' | 'icon';
    fontSize?:string;
    onClick?: (e:any) => (void) | void;
    onToggleClick?: { true: () => void; false: () => void }
    items?: string[];
    onItemClicks ?: ((e: any) => void)[];
    size?:string;
    htmlType?:"button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    className?: string;
    children?:React.ReactNode;
}
export default function Button({ type = 'cta', fontSize = '1em', onClick, items, onItemClicks, size, htmlType, disabled, children, ...props } : ButtonProps){

    // Toggle Button Setup
    if (type==="toggle"){
        return <Toggle onClick={props.onToggleClick} size={size} disabled={disabled}/>;
        
    }

    // Selectable Button Setup
    if (type==="selectable"){
        return <Selectable onClick={props.onToggleClick} fontSize={fontSize} disabled={disabled}>
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
        <button onClick={onClick} className={type} disabled={disabled} type={htmlType || "button"} >
            {children}
        </button>);

    // General Button Setup
    return (
        <button onClick={onClick} className={`${props.className} ${type}`} disabled={disabled}
        style = {{fontSize}} type={htmlType || "button"} >
            <div className='gap-[0.5em] flex items-center'>
                {children}
            </div>
            
        </button>
    );
}