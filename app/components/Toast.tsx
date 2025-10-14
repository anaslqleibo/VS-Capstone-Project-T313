"use client";
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react";
import Icon from "@/public/icons/Icons";
import { FaCheck } from "react-icons/fa";

interface ToastProps{
    title?: string;
    type?: 'success' | 'error';
    timeout?: number;
    shown: boolean;
    setShown: Dispatch<SetStateAction<boolean>>;
    message: string;
    neverClose?: boolean;
    icon?: ReactNode;
}

function getTitle(type: string){
    switch(type){
        case "success":
            return "Success!";
        case "error":
            return "Error!";
        default:
            return "Title not found";
    }
}

function getColor(type: string){
    switch(type){
        case "success":
            return "var(--success-color)";
        case "error":
            return "var(--danger-color)";
        default:
            return "var(--light-grey)";
    }
}

function getIcon(type: string){
    switch(type){
        case "success":
            return <FaCheck/>;
        case "error":
            return <Icon id="warning"/>;
        default:
            return <Icon id="?"/>;
    }
}

export default function Toast({title, type, message, timeout, shown, setShown, ...props} : ToastProps){
    const activeColor = getColor(type??"");

    const timeRef = useRef<NodeJS.Timeout | null>(null);

    if (!props.neverClose){
        useEffect(() => {
        if (shown) {
            if (timeRef.current) clearTimeout(timeRef.current);

            timeRef.current = setTimeout(() => {
            setShown(false);
            }, timeout ?? 5000);
        }
        else if (timeRef.current) clearTimeout(timeRef.current);

            return () => {
                if (timeRef.current) {
                clearTimeout(timeRef.current);
                }
            };
        }, [shown]);
    }
    return (
        <div className={`toast bg-white border-2 rounded-xl flex-col mx-auto absolute z-200 top-6 left-1/2 -translate-x-1/2 p-4 min-w-[70%] md:min-w-[50%] md:w-fit w-64 shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-[transform, opacity] duration-500 ease-out ${shown ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"}`} style={ {borderColor: activeColor, color: activeColor} } onClick={()=>setShown(false)}>


            <div className="flex justify-between mb-2">
                <div className="font-bold text-lg">
                {type ? getTitle(type) : "Please pass in a title through the 'title' property"}
                </div>
                
                {props.icon ? props.icon : getIcon(type??'')}
            </div>

            <p className="text-left">{message}</p>
        </div>
    );
}