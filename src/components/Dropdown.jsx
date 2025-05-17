import { useState, useRef, useEffect } from 'react';
import Icon from '../assets/icons/Icons';

const Dropdown = ({
  items = [],
  multiple = false,
  showCheckbox,
  placeholder = 'Select an option',
  maxVisibleItems = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const containerRef = useRef(null);
  const itemHeight = 40; // px per item
  const maxHeight = maxVisibleItems * itemHeight;

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (item) => {
    if (multiple) {
      if (selected.includes(item)) {
        setSelected(selected.filter(i => i !== item));
      } else {
        setSelected([...selected, item]);
      }
    } else {
      setSelected([item]);
      setIsOpen(false);
    }
  };

  const handleRemove = (item) => {
    setSelected(selected.filter(i => i !== item));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && search === '' && selected.length > 0) {
      setSelected(selected.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-72" ref={containerRef}>
      <div className="border-2 border-[color:var(--primary-color)] rounded-md px-3 py-2 flex items-center justify-between cursor-pointer text-[color:var(--primary-color)]" onClick={toggleDropdown}>
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {/* {selected.length === 0 && <span className="text-gray-500">{placeholder}</span>} */}

          {(!multiple && selected.length>0) ? <span className="text-[color:var(--primary-color)]">{selected.at(0)}</span> : selected.map((item, index) => (
            <span
              key={index}
              className="flex items-center gap-1 bg-gray-100 border border-[color:var(--primary-color)] text-[color:var(--primary-color)] px-2 py-1 rounded whitespace-nowrap"
            >
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
            onChange={(e) => {
                setSearch(e.target.value)
                if (filteredItems.length>0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="outline-none min-w-[20px] grow px-1"
            placeholder={selected.length === 0 ? placeholder : ''}
          />
        </div>

        {isOpen ? <Icon id="chevron" width="1em" height="0.5em" className='rotate-180 transition-transform'/> : <Icon id="chevron" width="1em" height="0.5em" className='transition-transform'/>}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 shadow-md rounded-md max-h-60 overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer ${!showCheckbox&&selected.includes(item) ? "bg-gray-200": "hover:bg-gray-100"} `}
                onClick={(e) => {
                    setSearch("");
                    handleSelect(item);
                }}
              >
                <span>{item}</span>
                {multiple && showCheckbox && (
                  <input type="checkbox" checked={selected.includes(item)} readOnly />
                  // TODO: Replace with custom Checkbox
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;