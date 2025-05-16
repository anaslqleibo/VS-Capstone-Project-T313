import { useState, useRef, useEffect } from 'react';
import './Button.css';
import Icon from '../assets/icons/Icons';

function Toggle({size = '0.6em', onClick, ...props}){
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
         style={{ fontSize: size }}>
        <div>
            <Icon id="checkmark"/>
        </div>
    </div>
);
}

function Selectable({onClick, fontSize, ...props}){
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

function Dropdown({fontSize, onItemClicks, ...props}){
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
            {props.children || <>Add task</>}

            <span className={`dropdown-icon ${open ? 'rotate' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="0.5em" viewBox="0 0 16 8" fill="none" style={{ verticalAlign: 'middle' }}>
                    <path d="M8 7.5L15.7942 0H0.205771L8 7.5Z" fill="currentColor" />
                </svg>  
            </span>
        </button>

        {open && (
            <div className="dropdown-menu">
                {
                props.items ? props.items.map((item, index) =>
                    <div className="dropdown-item" 
                    onClick={(onItemClicks && onItemClicks[index]) ? onItemClicks[index] : {}}>
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


function Button({ type = 'cta', fontSize = '1em', onClick, items, onItemClicks, size, htmlType, ...props }){

    // Toggle Button Setup
    if (type==="toggle"){
        let toggle;
        if (size && size.includes('em'))
            toggle = <Toggle onClick={onClick} size={size} disabled={props.disabled}/>;
        else
            toggle = <Toggle onClick={onClick} disabled={props.disabled}/>;
        return toggle;
    }

    // Selectable Button Setup
    if (type==="selectable"){
        return <Selectable onClick={onClick} fontSize={fontSize} disabled={props.disabled}>
            {props.children}
        </Selectable>;
    }

    // Dropdown Button Setup
    if (type === "dropdown") {
        return <Dropdown onItemClicks={onItemClicks} fontSize={fontSize} items={items} disabled={props.disabled}>{props.children}</Dropdown>;
    }

    // Icon Button Setup --> Size automatically fit the icon's size
    if (type.includes("icon"))
        return (
        <button onClick={onClick} className={type} disabled={props.disabled} type={props.htmlType || "button"} >
            {props.children}
        </button>);

    // General Button Setup
    return (
        <button onClick={onClick} className={type} disabled={props.disabled}
        style = {{fontSize}} type={htmlType || "button"} >
            <div className='gap-[0.5em] flex items-center'>
                {props.children}
            </div>
            
        </button>
    );
}

export default Button;