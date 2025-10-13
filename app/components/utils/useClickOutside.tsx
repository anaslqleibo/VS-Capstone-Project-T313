import { useEffect } from 'react';

/**
 * Add a event handler to close an overlay if there is click detected outside 'ref'
 * @param ref The target object/overlay
 * @param handler The event to be executed when a click outside of the object is detected
 * @param toggleButtonRef An additional object to consider as part of the target/overlay
 */
export function useClickOutside(ref: React.RefObject<HTMLElement|HTMLDivElement|null>, handler: () => void, toggleButtonRef?: React.RefObject<HTMLButtonElement|HTMLDivElement|null>) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {

        if (toggleButtonRef?.current?.contains(event.target as Node)) return;

        const target = event.target as HTMLElement;
        const timePicker = target.closest('.MuiPopper-root');
        const datePicker = target.closest('.MuiDialogContent-root');
        if (timePicker || datePicker) return;

        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

/**
 * Adds a fade in and fade out animation for overlays
 * @param shown A boolean representing if the overlay should start being shown
 * @param setRendered SetStateAction used to set whether the overlay is finished rendering
 * @param setVisible SetStateAction used to set whether the overlay start/stop being visible
 * @param container The container of the overlay element
 * @param setParentOpen SetStateAction used to close the parent of the overlay
 */
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