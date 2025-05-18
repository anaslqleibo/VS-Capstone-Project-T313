import Icon from "../assets/icons/Icons";
import React, { useEffect, useRef, useState } from "react";

function ListView({title, closeButton=true,...props}){
    const [isShown, setShown] = useState(true); //TODO: change this to be false
    const [items, setItems] = useState(
        React.Children.toArray(props.children).map(child => ({
            id: crypto.randomUUID(),
            content: child
        }))
    );
    const [removalQueue, setRemovalQueue] = useState({}); 
    const containerRef = useRef(null);
    const notificationItems = useRef({});
  
    useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePermanentRemove = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setRemovalQueue((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };

    const markAsRead = (id) => {
        const node = notificationItems.current[id];
        node.style.transform="translate(100%,0)";
        const timeoutId = setTimeout(() => {
            handlePermanentRemove(id)
        }, 2000);
        setTimeout(() => {
            setRemovalQueue((prev) => ({ ...prev, [id]: timeoutId }));
            node.style.transform="none";
        }, 300);
    };

    const handleUndo = (id) => {
        const timeoutId = removalQueue[id];
        if (timeoutId) {
            clearTimeout(timeoutId);
            const node = notificationItems.current[id];
            node.style.transform="translate(100%,0)";
            setTimeout(() => {
                setRemovalQueue((prev) => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
                node.style.transform="none";
            }, 200);
        }
    };

    const isMarkedForRemoval = (id) =>
        removalQueue.hasOwnProperty(id);

    return (
        <div class={`w-max text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden text-left ${isShown ? "block" : "hidden"}`} ref={containerRef}>
            <div class="w-full px-4 py-2 border-b border-gray-200 text-xl text-[color:var(--secondary-color))] font-semibold flex items-center justify-between gap-5">
                {title || "Title"}
                
                {closeButton && <Icon id="x" className="text-gray-700 hover:text-[color:var(--danger-color)]"
                onClick={()=>setShown(false)}/>}
                
            </div>
            <ul className="bg-[color:var(--primary-color)] transition-all">
                {items && items.length > 0 ? items.map((item, i) => {

                    const id = item.id;
                    const marked = isMarkedForRemoval(id);
                    return (
                        <div key={id} className="relative z-0">
                            <li
                                className="w-full px-4 py-2 border-b bg-white border-gray-200 hover:bg-gray-100 hover:cursor-pointer flex items-center justify-between gap-5 transition-all duration-300 ease-in-out group translate-0"
                                ref={r => notificationItems.current[id] = r}>
                                {item.content}

                                <Icon
                                    id="read"
                                    className={`invisible ${!marked && "group-hover:visible"}`}
                                    onClick={() => markAsRead(id)}/>   
                            </li>

                            {marked && (
                                <div
                                    className="absolute top-0 left-0 w-full h-full bg-[color:var(--primary-color)] text-white underline cursor-pointer tracking-wider z-10 flex items-center justify-center text-center transition-opacity"
                                    onClick={() => handleUndo(id)}>
                                    Undo
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <li className="w-full px-4 py-2 border-b border-gray-200 bg-white">No new notification</li>
                )}
            </ul>
        </div>
    );
}

export default ListView;
