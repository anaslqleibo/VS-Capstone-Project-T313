"use client";
import { useState, useRef, useEffect, Dispatch, SetStateAction, ReactNode } from 'react';
import Icon from '@/public/icons/Icons';
import dayjs from 'dayjs';
import { fetchLocations, Location } from '../controllers/Location';
import Input from './Input';
import { fetchAllEmployees, User } from '../controllers/User';
import getStatusColor, { Status, stringToStatus } from './utils/getStatusColor';

interface DropdownProps{
  items?:string[];
  multiple?:boolean;
  showCheckbox?:boolean;
  placeholder?:string;
  maxVisibleItems?:number;
  actAsFilter ?: boolean;
  setFilter ?: Dispatch<SetStateAction<string[]>> | ((e:string[]) => void);
  setMonth ?: dayjs.Dayjs;
  className?:string;
  initialSelectedItem ?: string;
  custom ?: boolean;
  customSelected?:string;
  children ?: ReactNode;
  props?:{[key:string] : any};
  onChange ?: (e:any) => void;
  disabled?:boolean;
  colorBasedOnValue?:boolean;
  startOpen?:boolean;
  syncCurrentWithInitialSelected?:boolean;
}

type DayPickerProps = {
  onChange: (e: string) => void;
  value?: string;
};
export function DayPicker({onChange, value}: DayPickerProps){
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return (
    <Dropdown items={days} placeholder='Select a day' className='border-gray-400 hover:border-black text-[16px] w-full placeholder-shown:text-[#000] text-black' onChange={onChange} initialSelectedItem={value}></Dropdown>
  );
}

const Dropdown = ({
  items = [],
  multiple = false,
  showCheckbox,
  placeholder = 'Select an option',
  maxVisibleItems = 3,
  className,
  colorBasedOnValue, 
  startOpen,
  syncCurrentWithInitialSelected,
  ...props
} : DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(startOpen || false);
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<string[]>(props.initialSelectedItem?[props.initialSelectedItem]:[]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setAdvSelected = (filteredItems:string[]) => {
    setSelected(filteredItems)
    if (props.actAsFilter) {
      props.setFilter?.(filteredItems);
    }
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
    if (props.onChange) props.onChange(item);

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
   
  const clearSelect = () => {
    setSelected([]);
  }

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
  
  useEffect(()=>{
    if (syncCurrentWithInitialSelected) {
      if (props.initialSelectedItem)
        handleSelect(props.initialSelectedItem);
      else {
        clearSelect()
        setIsOpen(true);
      };
    }
  }, [props.initialSelectedItem])
  
  const activeColor = (colorBasedOnValue&&selected[0]) ? getStatusColor(stringToStatus(selected[0])) : 'var(--color-primary)';
  return (
    <div className={`relative w-fit min-w-fit text-sm ${className} ${props.disabled ? "pointer-events-none" : ""}`} ref={containerRef}>
      <div className={` ${props.actAsFilter ? "bg-[color:var(--secondary-color)] text-white" : 'border-1 border-[color:var(--color-primary)] text-[color:var(--color-primary)]'} rounded-md ${className} px-3 py-2 flex items-center justify-between cursor-pointer ${props.disabled ? "bg-gray-200 text-gray-400" : ""}`} onClick={toggleDropdown} style={colorBasedOnValue ? {borderColor: activeColor, color:activeColor} : {}}>
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-fit">
          {!props.disabled && (props.custom ? <span>{props.customSelected}</span> : ((!multiple && selected.length>0) || 
          (multiple && selected.length == 1 && (!isOpen))) ? <span>{selected.at(0)}</span> : selected.map((item, index) => (
            <span key={index} className="flex items-center gap-1 bg-gray-100 border border-primary text-primary px-2 py-1 rounded whitespace-nowrap text-sm">
              {item}
              <Icon id="x" className="cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleRemove(item)}} />
            </span>
          )))}
          <input
            type="text"
            value={search}
            ref={inputRef}
            onChange={(e) => {
                setSearch(e.target.value)
                if (filteredItems.length>0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="outline-none grow px-1 field-sizing-content"
            placeholder={selected.length === 0 && !props.custom || props.disabled ? placeholder : ''}
          />
        </div>

        {isOpen ? <Icon id="arrow-down"  className='rotate-180 transition-transform'/> : <Icon id="arrow-down" className='transition-transform'/>}
      </div>

      {isOpen && (
        <div className={`absolute z-20 mt-1 ${props.custom ? "w-fit max-h-fit" : "w-full max-h-60 overflow-y-auto"} bg-white border border-gray-300 shadow-md rounded-md max-w-[${maxHeight}px]`}>

          {props.custom && props.children}

          {!props.custom && (
            filteredItems.length > 0 ? 
            (filteredItems.map((item, index) => (
              <div key={index} className={`flex items-center justify-between px-3 py-2 cursor-pointer text-left ${!showCheckbox&&selected.includes(item) ? "bg-gray-200": "hover:bg-gray-100"} `} onClick={(e) => {
                    setSearch("");
                    handleSelect(item);
                }}>
                <span>{item}</span>
                {multiple && showCheckbox && (
                  <input type="checkbox" checked={selected.includes(item)} readOnly />
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

type CustomDropdownProps = {
  detail?: string;
  setUpdatedDetail?: (field: string, value: string) => void;
  onSelect?: (loc: Location) => void;
}
export function LocationDropdownWithAddress({detail, setUpdatedDetail, onSelect,}: CustomDropdownProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    async function load() {
      const locs = await fetchLocations();
      setLocations(locs);

      const found = locs.find((l) => l.name === detail);
      if (found) {
        setSelectedLocation(found);
        setUpdatedDetail?.("location_id", found.id);
        setUpdatedDetail?.("location_name", found.name);
        setUpdatedDetail?.("address", found.address);
        onSelect?.(found);
      }
    }
    load();
  }, [detail]);

  const handleChange = (name: string) => {
    const loc: Location =
      locations.find((l) => l.name === name) || {
        id: "-1",
        name: "Not found",
        address: "Not found",
      };

    setSelectedLocation(loc);
    setUpdatedDetail?.("location_id", loc.id);
    setUpdatedDetail?.("location_name", loc.name);
    setUpdatedDetail?.("address", loc.address);
    onSelect?.(loc);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Dropdown
        items={locations.map((l) => l.name)}
        placeholder="Select location"
        maxVisibleItems={6}
        initialSelectedItem={detail ?? undefined}
        className="text-black border-gray-400 min-w-32 max-w-64"
        onChange={handleChange}
      />

      <Input
        value={selectedLocation?.address ?? ""}
        className="py-2 px-3 border-1"
        containerClassName="w-full"
        readonly
      />
    </div>
  );
}


export function DropdownUser({detail, setUpdatedDetail}: CustomDropdownProps){
  // const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  useEffect(() => {
    async function load() {
      const employees = await fetchAllEmployees();
      const found = employees.find((e) => (e.first_name + ' ' + e.last_name) === detail);
      if (found) {
        // setSelectedEmployee(found);
        setUpdatedDetail?.("assignee_id", found.id.toString());
        setUpdatedDetail?.("assignee_name", found.first_name + ' ' + found.last_name);
      }
      
      setEmployees(employees);
    }
    
     load();
  }, [detail]);

  const handleChange = (name: string) => {
    if (employees.length === 0) return; 
    const employee: User =
      employees.find((e) => (e.first_name + " " + e.last_name) === name) || {
        id: -1,
        first_name: "Not found",
        last_name: "",
        email: '',
        role: 'user',
      };

    // setSelectedEmployee(employee);
    setUpdatedDetail?.("assignee_id", employee.id.toString());
    setUpdatedDetail?.("assignee_name", employee.first_name + ' ' + employee.last_name);
    setUpdatedDetail?.("status", 'Pending');
  };

  return (<Dropdown items={employees.map((employee) => (employee.first_name + ' ' + employee.last_name))} placeholder="Select employee" maxVisibleItems={6} className=' font-normal text-black border-gray-400 min-w-32 max-w-64' initialSelectedItem={detail === '' ?  undefined : detail} onChange={handleChange} startOpen={detail === ''} syncCurrentWithInitialSelected={true}/>);
}