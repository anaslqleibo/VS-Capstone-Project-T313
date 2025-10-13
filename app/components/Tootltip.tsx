"use client";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  textWhenContentEmpty?:string;
  timeoutHide?:number;
  timeoutShow?:number;
  inline?:boolean;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  textWhenContentEmpty,
  timeoutHide,
  timeoutShow,
  inline=true,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [tooltipSize, setTooltipSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Measure tooltip size after it's rendered
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ width: rect.width, height: rect.height });
    }
  }, [visible, content]);


  const [timer, setTimer] = useState<any>(null);
  const showTooltip = () => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });

      if (timeoutShow) 
        setTimer(setTimeout(() => {
        setVisible(true);
      }, timeoutShow));
      else setVisible(true);
    }
  };

  useEffect(()=>{
    if (visible && timeoutHide){
      setTimer(setTimeout(() => {
        hideTooltip();
      }, timeoutHide));
    }
  }, [visible])
  const hideTooltip = () => {clearTimeout(timer);setVisible(false)};

  // Calculate dynamic position
  const getTooltipStyle = () => {
    let top = coords.top;
    let left = coords.left;
    let transform = "translateX(-50%)";

    switch (position) {
      case "top":
        top = coords.top - tooltipSize.height - 8;
        break;
      case "bottom":
        top = coords.top + (targetRef.current?.offsetHeight || 0) + 8;
        break;
      case "left":
        top = coords.top + (targetRef.current?.offsetHeight || 0) / 2 - tooltipSize.height / 2;
        left = coords.left - (tooltipSize.width / 2) - (targetRef.current?.offsetWidth || 0) / 2 - 8;
        transform = "";
        break;
      case "right":
        top = coords.top + (targetRef.current?.offsetHeight || 0) / 2 - tooltipSize.height / 2;
        left = coords.left + (tooltipSize.width / 2) + (targetRef.current?.offsetWidth || 0) / 2 + 8;
        transform = "";
        break;
    }

    return {
      position: "absolute" as "absolute",
      top,
      left,
      transform,
      zIndex: 9999,
      pointerEvents: "none" as "none",
      whiteSpace: "normal" as "normal", // allow multi-line
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s",
    };
  };

  return (
    <>
      <div ref={targetRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} className={inline?'inline':""}>
        {children}
      </div>

      {createPortal(
        <div ref={tooltipRef} style={getTooltipStyle()}>
          <div className="bg-active text-white text-sm px-2 py-1 rounded shadow-md break-words">
            {content ? content : (textWhenContentEmpty?textWhenContentEmpty:'None')}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}