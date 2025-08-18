import { useEffect } from 'react';

export function useClickOutside(ref: React.RefObject<HTMLElement|HTMLDivElement|null>, handler: () => void, toggleButtonRef?: React.RefObject<HTMLButtonElement|HTMLDivElement|null>) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {

        if (toggleButtonRef?.current?.contains(event.target as Node)) return;

        const target = event.target as HTMLElement;
        const tooltipOrPicker = target.closest('.MuiPopper-root');
        if (tooltipOrPicker) return;

        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

export function overlayAnimation(shown: boolean, setRendered:(e:boolean)=>void, setVisible:(e:boolean)=>void,container?: HTMLDivElement | HTMLElement, setParentOpen?: (e:boolean)=>void){
  if (container)
   {
    useEffect(() => {
      if (container){
          container.classList.toggle("pointer-events-none", !shown);
      }

      if (shown) {
          setRendered(true);
          const timeout = setTimeout(() => setVisible(true), 50); // delay to set to 0 opacity
          return () => clearTimeout(timeout);
      } else {
          setVisible(false);
          const timeout = setTimeout(() => {setRendered(false); if (setParentOpen) setParentOpen(false);}, 200);

          
          return () => clearTimeout(timeout);
          
      }
    }, [shown]);
  }
}