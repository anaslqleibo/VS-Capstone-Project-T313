"use client";
import { useState } from "react";
import Icon from "@/public/icons/Icons";

interface AccordionProps{
    text: string;
    children?: React.ReactNode;
    className?: string;
    componentClassName?: string;
    dropdownContainerLastName?: string;
    startOpen?: boolean;
    preventResizeOtherElementsOnOpen?:boolean;
}

export default function Accordion({text, dropdownContainerLastName, ...props}: AccordionProps){
    const [open, setOpen] = useState(props.startOpen??false);
    return (
        <div className={props.className}>
            <div onClick={()=>setOpen((prev)=>!prev)} className={`border-b-1 border-[color:var(--primary-color)] text-[color:var(--primary-color)] font-semibold px-4 py-2 rounded-md flex items-center justify-between ${props.preventResizeOtherElementsOnOpen && (open ? "h-fit": "h-full")} ${props.componentClassName} `}>

                {text}

                {open ? <Icon id="chevron" width="1em" height="0.5em" className='rotate-180 transition-transform'/> : <Icon id="chevron" width="1em" height="0.5em" className='transition-transform'/>}                
            </div>

            <div className={`${dropdownContainerLastName&&dropdownContainerLastName?.includes('bg-') ? '' : 'bg-gray-200'} rounded-b-md duration-400 ease-in-out transition-[max-height,padding] overflow-hidden ${open ? "max-h-96" : "max-h-0"} ${dropdownContainerLastName}`} >

                <div className="transition-opacity duration-300 p-4" style={{ opacity: open ? 1 : 0 }}>
                    {props.children}
                </div>
                
            </div>
        </div>
    );
}