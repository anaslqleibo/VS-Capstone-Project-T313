
"use client";
import Layout from '@/app/components/Layout';
import Input, { InputIcon } from '@/app/components/Input';
import { useEffect, useRef, useState } from 'react';
import { fetchLocations, Location } from '@/app/controllers/Location';
import Accordion from '@/app/components/Accordion';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/app/components/Button';
import Icon from '@/public/icons/Icons';
import useIsOverMd from '@/app/components/utils/useIsOverMd';
import Modal, { createModal } from '@/app/components/Modal';
import AddressAutocomplete from '@/app/components/AddressAutocomplete';
import Spinner from '@/app/components/Spinner';

const LocationsPage = () => {
  const modalContainer = useRef<HTMLDivElement>(null);
  const [allLocations, setAllLocations] = useState<Location[]|null>(null);
  const [filter, setFilter] = useState<'name'|'address'>('name');
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<Location[]|null>(null);
  
  const councils = [
    {
      title: 'Brisbane City Council – BCC',
      locations: Array(10).fill('Bald Hills Boat Ramp'),
    },
    {
      title: 'Logan City Council – LCC',
      locations: Array(10).fill('Bald Hills Boat Ramp'),
    },
    {
      title: 'Moreton Bay Regional Council – MBRC',
      locations: Array(10).fill('Bald Hills Boat Ramp'),
    },
  ];

  useEffect(() => {
    async function getLocations() {
      const locations = await fetchLocations();
      setAllLocations(locations);
      setLocations(locations);
    }

    getLocations();
  }, []);

  useEffect(() => {
    if (locations && allLocations){
      if (search === ''){
        setLocations(allLocations);
      }
      else{
        if (filter === 'name')
          setLocations(allLocations.filter((loc)=>loc.name.toLowerCase().includes(search.toLowerCase())));
        else setLocations(allLocations.filter((loc)=>loc.address.toLowerCase().includes(search.toLowerCase())));
      }
    }
  }, [search]);

  const user = useAuth().user;
  const isAdmin = user?.role === "admin";

  const onToggleName = {
      true: function(){setFilter("name")},
      false: function(){setFilter("address")},
  };

  const onToggleAddress = {
      true: function(){setFilter("address")},
      false: function(){setFilter("name")},
  };

  const isOverMd = useIsOverMd();

  const [openModal, setOpenModal] = useState(false);
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  return (
    <Layout modalContainer={modalContainer}>
      <div className="flex h-full">

      {isAdmin && !isOverMd && <Button type='fab' className='absolute right-10 bottom-6 w-16 h-16 z-50'><Icon id="plus" width='1.5em' height='1.5em' onClick={(e)=>setOpenModal(true)}  /></Button>}

      <main className="w-full bg-[#f9f9fb] overflow-hidden flex flex-col">   
       <div className="flex justify-between items-center ">

          <div className="flex flex-wrap items-center gap-2">
            <span>Search by: </span>
            <Button type='selectable' fontSize="0.8em" startActive={filter==='name'} onToggleClick={onToggleName}className='py-1 px-4'>Name</Button>
            <Button type='selectable' fontSize="0.8em" startActive={filter==='address'} onToggleClick={onToggleAddress} className='py-1 px-4'>Address</Button>
          </div>

            {isAdmin && isOverMd && <Button className='py-2 px-4' fontSize="0.8em" onClick={(e)=>setOpenModal(true)}><Icon id="plus"/>Add new</Button>}
        </div>

      <InputIcon placeholder="Search locations..." type="search" icon="search" className='w-full mt-1 mb-4' value={search} onChange={(e)=>setSearch(e.target.value)}/>
  
      {locations ? 
        <div className='h-full overflow-y-auto flex-1'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            { locations && locations.map((loc) => (
              <Accordion text={loc.name} key={loc.id} className='w-full h-full' componentClassName="w-full px-2 py-4 text-sm rounded-lg bg-gray-200 cursor-pointer ease-in duration-200 text-black hover:bg-[color:var(--hover-color)] hover:text-white gap-4" dropdownContainerLastName='text-sm -translate-y-1 bg-gray-100'>
                <div className='flex flex-col'>
                  <span><span className='font-semibold'>Address:</span> {loc.address}</span>
                  {loc.notes && <span><span className='font-semibold'>Notes:</span> {loc.notes}</span>}
                </div>
              </Accordion>
            ))

            }
          </div>
        </div>: <Spinner/>}
        

        {openModal && modalContainer.current && 
        <Modal details={{}} startOpen={true} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title='Add new location'>

          <div className='w-full'>
          <div className="flex items-center gap-2 text-sm mt-2 w-full">
              <div className="font-semibold text-gray-600">
                  Name: 
              </div>
              <Input className="py-1 px-3 border-1" containerClassName="w-32"/>
          </div>

          <div className="flex items-center gap-2 text-sm mt-2 w-full">
              <div className="font-semibold text-gray-600">Address: </div>
              {/* <Input className="py-1 px-3 border-1" containerClassName="w-64"/> */}

              {<AddressAutocomplete/>}
          </div>
          
            <p className="text-sm font-semibold text-gray-600 mt-1 mb-1">Notes</p>
            <textarea className="text-gray-500 font-normal text-sm border-2 border-gray-500 bg-gray-100 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0"></textarea>

          </div>
          
          
        </Modal>}
      </main>
    </div>
    </Layout>
    
  );
};

export default LocationsPage;
