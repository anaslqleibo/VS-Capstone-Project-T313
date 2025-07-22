import { useEffect } from 'react';

export function useClickOutside(ref: React.RefObject<HTMLElement|HTMLDivElement|null>, handler: () => void, toggleButtonRef?: React.RefObject<HTMLButtonElement|HTMLDivElement|null>) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {

        if (toggleButtonRef?.current?.contains(event.target as Node)) return;
        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

export function overlayAnimation(shown: boolean, setRendered:(e:boolean)=>void, setVisible:(e:boolean)=>void,container?: HTMLDivElement ){
  
  if (container)
   {
      useEffect(() => {
        if (container){
            const isModalShown = container.childElementCount > 0;
            container.classList.toggle("pointer-events-none", isModalShown);
        }

    if (shown) {
        setRendered(true);
        const timeout = setTimeout(() => setVisible(true), 50); // delay to set to 0 opacity
        return () => clearTimeout(timeout);
    } else {
        setVisible(false);
        const timeout = setTimeout(() => setRendered(false), 200);
        return () => clearTimeout(timeout);
    }
    }, [shown]);
  }
}