import { useState, useRef, useEffect, Dispatch, SetStateAction, ReactNode } from 'react';
import Icon from '../assets/icons/Icons';

interface DropdownProps{
  items?:string[];
  multiple?:boolean;
  showCheckbox?:boolean;
  placeholder?:string;
  maxVisibleItems?:number;
  actAsFilter ?: boolean;
  setFilter ?: Dispatch<SetStateAction<string[]>>;
  className?:string;
  initialSelectedItem ?: string;
  custom ?: boolean;
  children ?: ReactNode;
  props?:{[key:string] : any};
}

const Dropdown = ({
  items = [],
  multiple = false,
  showCheckbox,
  placeholder = 'Select an option',
  maxVisibleItems = 3,
  className, ...props
} : DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<string[]>(props.initialSelectedItem?[props.initialSelectedItem]:[]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setAdvSelected = (filteredItems:string[]) => {
    setSelected(filteredItems)
    if (props.actAsFilter) props.setFilter?.(filteredItems);
  }

  const itemHeight = 40; // px per item
  const maxHeight = maxVisibleItems * itemHeight;

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    inputRef.current?.focus();
  };

  const handleSelect = (item : string) => {
    if (multiple) {
      if (selected.includes(item)) {
        setAdvSelected(selected.filter(i => i !== item));
      } else {
        setAdvSelected([...selected, item]);
      }
    } else {
      setAdvSelected([item]);
      setIsOpen(false);
    }
  };

  const handleRemove = (item : string) => {
    setAdvSelected(selected.filter(i => i !== item));
  };

  const handleKeyDown = (e : React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && search === '' && selected.length > 0) {
      setAdvSelected(selected.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event : MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!multiple) setSearch("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-fit min-w-32 text-sm  ${className}`} ref={containerRef}>
      <div className={` ${props.actAsFilter ? "bg-[color:var(--secondary-color)] text-white" : "border-[color:var(--primary-color)] text-[color:var(--primary-color)]"} rounded-md ${className} px-3 py-2 flex items-center justify-between cursor-pointer`} onClick={toggleDropdown}>
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {/* {selected.length === 0 && <span className="text-gray-500">{placeholder}</span>} */}
          {((!multiple && selected.length>0) || (multiple && selected.length == 1)) ? <span>{(!isOpen) && selected.at(0)}</span> : selected.map((item, index) => (
            <span key={index} className="flex items-center gap-1 bg-gray-100 border border-[color:var(--primary-color)] text-[color:var(--primary-color)] px-2 py-1 rounded whitespace-nowrap text-sm">
              {item}
              <Icon id="x" className="cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleRemove(item)}} />
            </span>
          ))}
          <input
            type="text"
            value={search}
            ref={inputRef}
            onChange={(e) => {
                setSearch(e.target.value)
                if (filteredItems.length>0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="outline-none w-0.5 grow px-1"
            placeholder={selected.length === 0 ? placeholder : ''}
          />
        </div>

        {isOpen ? <Icon id="chevron" width="1em" height="0.5em" className='rotate-180 transition-transform'/> : <Icon id="chevron" width="1em" height="0.5em" className='transition-transform'/>}
      </div>

      {isOpen && (
        <div className={`absolute z-10 mt-1 ${props.custom ? "w-fit" : "w-full"} bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto max-w-[${maxHeight}px]`}>

          {props.custom && props.children}

          {!props.custom && (
            filteredItems.length > 0 ? 
            (filteredItems.map((item, index) => (
              <div key={index} className={`flex items-center justify-between px-3 py-2 cursor-pointer ${!showCheckbox&&selected.includes(item) ? "bg-gray-200": "hover:bg-gray-100"} `} onClick={(e) => {
                    setSearch("");
                    handleSelect(item);
                }}>
                <span>{item}</span>
                {multiple && showCheckbox && (
                  <input type="checkbox" checked={selected.includes(item)} readOnly />
                  // TODO: Replace with custom Checkbox
                )}
              </div>
            )))
           : (
            <div className="px-3 py-2 text-gray-500">No results found</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;