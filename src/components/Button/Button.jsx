import { useState, useRef, useEffect } from 'react';
import './Button.css';

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
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 25 25" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M21.1403 5.20693C21.2445 5.287 21.3319 5.38682 21.3975 5.50068C21.463 5.61454 21.5056 5.74021 21.5226 5.87051C21.5395 6.0008 21.5307 6.13318 21.4965 6.26005C21.4623 6.38693 21.4035 6.50582 21.3233 6.60993L11.3233 19.6099C11.2365 19.7227 11.1267 19.8156 11.0012 19.8826C10.8756 19.9495 10.7372 19.9889 10.5952 19.9981C10.4533 20.0072 10.311 19.986 10.1778 19.9358C10.0447 19.8856 9.92384 19.8076 9.82328 19.7069L4.82328 14.7069C4.64113 14.5183 4.54033 14.2657 4.54261 14.0035C4.54489 13.7413 4.65006 13.4905 4.83547 13.3051C5.02087 13.1197 5.27169 13.0145 5.53388 13.0123C5.79608 13.01 6.04868 13.1108 6.23728 13.2929L10.4323 17.4879L19.7373 5.38993C19.8174 5.28574 19.9172 5.19835 20.031 5.13276C20.1449 5.06717 20.2706 5.02466 20.4009 5.00767C20.5312 4.99067 20.6635 4.99952 20.7904 5.03371C20.9173 5.06791 21.0362 5.12677 21.1403 5.20693Z" fill="#2D3AA0"/>
</svg>
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


function Button({ type = 'cta', fontSize = '1em', onClick, items, onItemClicks, size, ...props }){

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
        <button onClick={onClick} className={type} disabled={props.disabled}>
            {props.children}
        </button>);

    // General Button Setup
    return (
        <button onClick={onClick} className={type} disabled={props.disabled}
        style = {{fontSize}}>
            {props.children}
        </button>
    );
}

export default Button;