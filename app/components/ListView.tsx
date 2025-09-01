"use client";
import Icon from "@/public/icons/Icons";
import React, { forwardRef, JSX, ReactElement, ReactNode, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { overlayAnimation, useClickOutside } from "./utils/useClickOutside";
import { createRoot } from "react-dom/client";

interface ListViewProps {
  title: string;
  closeButton?: boolean;
  containerRef: React.RefObject<HTMLDivElement|null>;
  setShown?:(e:boolean)=>void;
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
  { title, closeButton = true, containerRef, ...props },
  ref
) {
  // const [shown, setShown] = useState(true);
  //  useImperativeHandle(ref, () => ({
  //   toggleShown: () => setShown((prev) => !prev),
  // }));  


  const [items, setItems] = useState<Item[]>(
    flattenChildren(props.children).map((child) => ({
      id: crypto.randomUUID(),
      content: child as Item["content"],
    }))
  );

  const [removalQueue, setRemovalQueue] = useState<RemovalQueue>({});
  const notificationItems = useRef<NotificationItems>({});

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
  
  return (<div className='w-full md:w-max h-80 flex flex-col text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden text-left shadow-xl transition-all my-auto' ref={containerRef}>
                  <div className="w-full h-fit px-4 py-2 border-b border-gray-200 text-xl text-[color:var(--secondary-color))] font-semibold flex items-center justify-between gap-5">
                    {title || "Title"}

                    {closeButton && (
                      <Icon
                        id="x"
                        className="text-gray-700 hover:text-[color:var(--danger-color)]"
                        onClick={() => props.setShown?.(false)}
                      />
                    )}
                  </div>
                  <ul className="bg-[color:var(--primary-color)] transition-all overflow-y- overflow-x-hidden">
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
                            <li className="w-full px-4 py-2 border-b bg-white border-gray-200 hover:bg-gray-100 hover:cursor-pointer flex items-center justify-between gap-5 transition-all duration-300 ease-in-out group translate-0"
                              onClick={handleParentClick}
                              ref={r => {notificationItems.current[id] = r;}}>
                              {item.content}

                              <Icon
                                id="read"
                                className={`md:invisible ${!marked && "group-hover:visible"}`}
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
    );
});

export default ListView;
