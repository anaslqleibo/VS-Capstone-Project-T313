"use client";
import { ReactNode, useState } from "react";
import Icon from "@/public/icons/Icons";

interface AccordionProps{
    text: string;
    children?: React.ReactNode;
    className?: string;
    componentClassName?: string;
    dropdownContainerClassName?: string;
    startOpen?: boolean;
    preventResizeOtherElementsOnOpen?:boolean;
    hideArrow?: boolean;
    titleChildren?:React.ReactNode;
    noChildTransition?: boolean;
    titleIcon?:ReactNode;
}

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
                {props.noChildTransition ? props.children :
                    <div className="transition-opacity duration-300 p-4" style={{ opacity: open ? 1 : 0 }}>
                        {props.children}
                    </div>
                }
                
                
            </div>
        </div>
    );
}