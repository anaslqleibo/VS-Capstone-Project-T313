"use client";
import { ReactNode, useState } from "react";
import Icon from "@/public/icons/Icons";

interface AccordionProps{
    // The text shown in the main component
    text: string;

    // The elements inside the collapsible container
    children?: React.ReactNode;

    // string to store class names applied to the top element
    className?: string;

    // string to store class names applied to the main component
    componentClassName?: string;

    // string to store class names applied to the dropdown container
    dropdownContainerClassName?: string;

    // Set the initial state of the accordion, open or closed
    startOpen?: boolean;

    // Prevent resizing of current element when other elements in the same column changes height
    preventResizeOtherElementsOnOpen?:boolean;

    // Hides arrow icon
    hideArrow?: boolean;

    // A ReactNode placed on the same level of the text inside the top element
    titleChildren?:React.ReactNode;
    noChildTransition?: boolean;
    titleIcon?:ReactNode;
}

/**
 * A collapsible component which can show and hide a child container
 * @returns Accordion component
 */
export default function Accordion({text, dropdownContainerClassName, ...props}: AccordionProps){
    const [open, setOpen] = useState(props.startOpen??false);
    return (
        <div className={props.className}>
            <div onClick={()=>setOpen((prev)=>!prev)} className={`border-b-1 border-[color:var(--primary-color)] text-[color:var(--primary-color)] font-semibold ${(props.componentClassName?.includes('p-') || props.componentClassName?.includes('py-') || props.componentClassName?.includes('px-')) ? '' : 'px-4 py-2'} rounded-md flex items-center justify-between ${props.preventResizeOtherElementsOnOpen && (open ? "h-fit": "h-full")} ${props.componentClassName} `}>
                {props.titleIcon}
                {text}
                {props.titleChildren}

                {!props.hideArrow && (open ? <Icon id="chevron" width="1em" height="0.5em" className='rotate-180 transition-transform'/> : <Icon id="chevron" width="1em" height="0.5em" className='transition-transform'/>)}                
            </div>

            <div className={`${dropdownContainerClassName&&dropdownContainerClassName?.includes('bg-') ? '' : 'bg-gray-200'} rounded-b-md duration-400 ease-in-out transition-[max-height,padding] overflow-hidden ${open ? "max-h-96" : "max-h-0"} ${dropdownContainerClassName}`} >

                <div className="transition-opacity duration-300 p-4" style={{ opacity: open ? 1 : 0 }}>
                    {props.children}
                </div>
                
            </div>
        </div>
    );
}