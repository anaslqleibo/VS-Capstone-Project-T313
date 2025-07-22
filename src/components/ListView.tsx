import Icon from "../assets/icons/Icons";
import React, { forwardRef, JSX, ReactElement, ReactNode, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { overlayAnimation, useClickOutside } from "./utils/useClickOutside";
import { createRoot } from "react-dom/client";

interface ListViewProps {
  title: string;
  closeButton?: boolean;
  container: HTMLDivElement|null;
  toggleButtonRef?: React.RefObject<HTMLButtonElement|HTMLDivElement|null>;
  children?: React.ReactNode;
}

interface Item {
  id: string;
  content: React.ReactNode & {
    props?: {
      onClick?: (e: React.MouseEvent) => void;
    };
  };
}

interface RemovalQueue {
  [key: string]: NodeJS.Timeout;
}

interface NotificationItems {
  [key: string]: HTMLLIElement | null;
}

function flattenChildren(children: ReactNode): ReactNode[] {
  return React.Children.toArray(children).flatMap(child => {
    if (
      React.isValidElement(child) &&
      child.type === React.Fragment
    ) {
      const fragment = child as ReactElement<{ children?: ReactNode }>;
      return flattenChildren(fragment.props.children);
    }
    return [child];
  });
}

export type ListViewHandle = {
  toggleShown: (value: boolean) => void;
};

const ListView = forwardRef<ListViewHandle, ListViewProps>(function ListView(
  { title, closeButton = true, container, toggleButtonRef, ...props },
  ref
) {
  const [shown, setShown] = useState(true);
   useImperativeHandle(ref, () => ({
    toggleShown: () => setShown((prev) => !prev),
  }));


  const [items, setItems] = useState<Item[]>(
    flattenChildren(props.children).map((child) => ({
      id: crypto.randomUUID(),
      content: child as Item["content"],
    }))
  );

  const [removalQueue, setRemovalQueue] = useState<RemovalQueue>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationItems = useRef<NotificationItems>({});

  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  

  useClickOutside(containerRef, ()=>setShown(false), toggleButtonRef);
  if (container) overlayAnimation(shown, setRendered, setVisible, container)

  const handlePermanentRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setRemovalQueue((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    const node = notificationItems.current[id];
    if (!node) return;
    node.style.transform = "translate(100%,0)";
    const timeoutId = setTimeout(() => {
      handlePermanentRemove(id);
    }, 2000);
    setTimeout(() => {
      setRemovalQueue((prev) => ({ ...prev, [id]: timeoutId }));
      node.style.transform = "none";
    }, 300);
  };

  const handleUndo = (id: string) => {
    const timeoutId = removalQueue[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      const node = notificationItems.current[id];
      if (!node) return;
      node.style.transform = "translate(100%,0)";
      setTimeout(() => {
        setRemovalQueue((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        node.style.transform = "none";
      }, 200);
    }
  };

  const isMarkedForRemoval = (id: string) =>
    Object.prototype.hasOwnProperty.call(removalQueue, id);
  
  const JSXComponent: JSX.Element = <>
    {rendered && <div className={`relative z-10 h-full transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} >
            
        <div aria-hidden="true" className={`absolute inset-0 bg-gray-200/75 backdrop-blur-sm transition-all duration-200 ${visible ? 'backdrop-opacity-100' : 'backdrop-opacity-0'}`}></div>

            <div className="relative z-10 w-full overflow-y-auto h-full">
              <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
              
                  {/* <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-auto sm:w-full sm:max-w-lg" ref={containerRef}>
                  
                  </div> */}

                  <div className={`w-max text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden text-left shadow-xl transition-all my-auto ${shown ? "block" : "hidden"}`} ref={containerRef}>
                  <div className="w-full px-4 py-2 border-b border-gray-200 text-xl text-[color:var(--secondary-color))] font-semibold flex items-center justify-between gap-5">
                    {title || "Title"}

                    {closeButton && (
                      <Icon
                        id="x"
                        className="text-gray-700 hover:text-[color:var(--danger-color)]"
                        onClick={() => setShown(false)}
                      />
                    )}
                  </div>
                  <ul className="bg-[color:var(--primary-color)] transition-all">
                    {items && items.length > 0 ? (
                      items.map((item) => {
                        const id = item.id;
                        const marked = isMarkedForRemoval(id);
                        const childOnClick = item.content?.props?.onClick;

                        function handleParentClick(e: React.MouseEvent) {
                          if (childOnClick) {
                            childOnClick(e);
                          }
                        }

                        return (
                          <div key={id} className="relative z-0">
                            <li
                              className="w-full px-4 py-2 border-b bg-white border-gray-200 hover:bg-gray-100 hover:cursor-pointer flex items-center justify-between gap-5 transition-all duration-300 ease-in-out group translate-0"
                              onClick={handleParentClick}
                              ref={r => {notificationItems.current[id] = r;}}
                            >
                              {item.content}

                              <Icon
                                id="read"
                                className={`invisible ${!marked && "group-hover:visible"}`}
                                onClick={(e:React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  markAsRead(id)}}
                              />
                            </li>

                            {marked && (
                              <div
                                className="absolute top-0 left-0 w-full h-full bg-[color:var(--primary-color)] text-white underline cursor-pointer tracking-wider z-10 flex items-center justify-center text-center transition-opacity"
                                onClick={() => handleUndo(id)}
                              >
                                Undo
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <li className="w-full px-4 py-2 border-b border-gray-200 bg-white">
                        No new notification
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
        </div>  }
      </>;
  
  
  return (<>{JSXComponent}</>);
});

export default ListView;
