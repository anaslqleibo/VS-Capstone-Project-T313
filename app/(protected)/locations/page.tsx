
"use client";
import Layout from '@/app/components/Layout';
import Input, { InputIcon } from '@/app/components/Input';
import { useEffect, useRef, useState } from 'react';
import { deleteLocation, fetchLocations, insertLocation, Location, updateLocation } from '@/app/controllers/Location';
import Accordion from '@/app/components/Accordion';
import { useAuth } from '@/app/contexts/AuthContext';
import Button from '@/app/components/Button';
import Icon from '@/public/icons/Icons';
import useIsOverMd from '@/app/components/utils/useIsOverMd';
import Modal, { createModal } from '@/app/components/Modal';
import AddressAutocomplete from '@/app/components/AddressAutocomplete';
import Spinner from '@/app/components/Spinner';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Form from '@/app/components/Form';
import Toast from '@/app/components/Toast';

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

  const [selectedLocation, setSelectedLocation] = useState<Location|null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<'add'|'edit'|'delete'>('add')
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }


  async function updateLoc(){
    if (selectedLocation){
      console.log(selectedLocation);
      const res = await updateLocation(selectedLocation);
      if (res){
        setAllLocations(allLocations&&selectedLocation&&[selectedLocation,...allLocations.filter((loc)=>loc.id!==selectedLocation.id)]);

        setLocations(locations&&selectedLocation&&[selectedLocation,...locations.filter((loc)=>loc.id!==selectedLocation.id)]);
        setOpenModal(false);
        displayToast(`Successfully updated location ${selectedLocation.name}!`, 'success');
        setSelectedLocation(null);
      }
      else{
        displayToast("Fail to update location", 'error');
      }
    }
  }

  async function deleteLoc(){
    if (selectedLocation){
      const res = await deleteLocation(selectedLocation?.id)
      if (res){
        setAllLocations(allLocations&&selectedLocation&&allLocations.filter((loc)=>loc.id!==selectedLocation.id));setLocations(locations&&selectedLocation&&locations.filter((loc)=>loc.id!==selectedLocation.id));
        setOpenModal(false);
        displayToast(`Successfully deleted location ${selectedLocation.name}!`, 'success');
        setSelectedLocation(null);
      } 
      else{
        displayToast("Fail to delete location", 'error');
      }
    }
    else{
      displayToast("Location object not found", 'error');
    }
  }

  async function addNewLoc(){
    if (selectedLocation){
      const res = await insertLocation(selectedLocation);
      if (res){
        console.log('new iD', res);
        selectedLocation.id = res;

        setAllLocations(allLocations&&selectedLocation&&[...allLocations,selectedLocation]);
        setLocations(locations&&selectedLocation&&[...locations,selectedLocation]);
        setOpenModal(false);
        displayToast(`Successfully added new location ${selectedLocation.name}!`, 'success');
        setSelectedLocation(null);
      }
      else{
        displayToast("Fail to add new location", 'error');
      }
    }
    else{
      displayToast("Location object not found", 'error');
    } 
  }

  const addNewLocHandleClick = ()=>{setModalType('add'); setSelectedLocation(null); setOpenModal(true)}

  const isMobile = !useIsOverMd();

  return (
    <Layout modalContainer={modalContainer}>
      <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
      <div className="flex h-full">

      {isAdmin && !isOverMd && <Button type='fab' className='absolute right-10 bottom-6 w-16 h-16 z-50'><Icon id="plus" width='1.5em' height='1.5em' onClick={addNewLocHandleClick}  /></Button>}

      <main className="w-full bg-[#f9f9fb] overflow-hidden flex flex-col">   
       <div className="flex justify-between items-center ">

          <div className="flex flex-wrap items-center gap-2">
            <span>Search by: </span>
            <Button type='selectable' fontSize="0.8em" startActive={filter==='name'} onToggleClick={onToggleName}className='py-1 px-4'>Name</Button>
            <Button type='selectable' fontSize="0.8em" startActive={filter==='address'} onToggleClick={onToggleAddress} className='py-1 px-4'>Address</Button>
          </div>

            {isAdmin && isOverMd && <Button className='py-2 px-4' fontSize="0.8em" onClick={addNewLocHandleClick}><Icon id="plus"/>Add new</Button>}
        </div>

      <InputIcon placeholder="Search locations..." type="search" icon="search" className='w-full mt-1 mb-4' value={search} onChange={(e)=>setSearch(e.target.value)}/>
  
      {locations ? 
        <div className='h-full overflow-y-auto flex-1'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            { locations && locations.map((loc) => (
              <Accordion text={loc.name} key={loc.id} className='w-full h-full' componentClassName="w-full px-2 py-4 text-sm rounded-lg bg-gray-200 cursor-pointer ease-in duration-200 text-black hover:bg-[color:var(--hover-color)] hover:text-white gap-4 *:hidden hover:*:flex" dropdownContainerLastName='text-sm -translate-y-1 bg-gray-100' hideArrow={true} 
              titleChildren={isAdmin && <div className='flex gap-3'>
                <FaEdit className='hover:text-[color:var(--primary-color)] ease-in duration-200' onClick={(e)=>{
                  e.stopPropagation();
                  setSelectedLocation(loc);
                  setModalType('edit');
                  setOpenModal(true);
                }}/>
                <FaTrash className='hover:text-[color:var(--danger-color)] ease-in duration-200' onClick={(e)=>{
                  e.stopPropagation();
                  setSelectedLocation(loc);
                  setModalType('delete');
                  setOpenModal(true);
                }}/>
            </div>}>
                <div className='flex flex-col'>
                  <span><span className='font-semibold'>Address:</span> {loc.address}</span>
                  {loc.notes && <span><span className='font-semibold'>Notes:</span> {loc.notes}</span>}
                </div>

                {isAdmin && isMobile && <div className='flex gap-2 justify-end mt-4'>
                  <div className='text-[color:var(--primary-color)] ease-in duration-200 bg-white p-2 rounded-md shadow-sm' onClick={(e)=>{
                  e.stopPropagation();
                  setSelectedLocation(loc);
                  setModalType('edit');
                  setOpenModal(true);
                }}><FaEdit /></div>
                
                <div className='text-[color:var(--danger-color)] ease-in duration-200 bg-white p-2 rounded-md  shadow-sm' onClick={(e)=>{
                  e.stopPropagation();
                  setSelectedLocation(loc);
                  setModalType('delete');
                  setOpenModal(true);
                }}><FaTrash/></div>
                
            </div>}
              </Accordion>
            ))

            }
          </div>
        </div>: <Spinner custom showWater backgroundGradient/>}
        

        { modalContainer.current && 
        <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title={modalType==='add'?"Add new location":modalType==='edit'?"Edit location details":"Delete confirmation"}>

          {modalType==='delete'?
          <>
            <div className='mt-4'>Are you sure you want to delete "{selectedLocation?.name}" at {selectedLocation?.address}</div>
            <div className='flex items-center justify-end gap-4 -mb-4 mt-4'> 
              <Button type="outline" fontSize="0.8em" className="bg-[color:var(--danger-color)" onClick={(e)=>setOpenModal(false)}>Cancel</Button>
              <Button type="cta" fontSize="0.8em" className="py-3 px-5 bg-[color:var(--danger-color)] hover:bg-[color:var(--danger-color-hover)]" onClick={()=>deleteLoc()}>Confirm</Button>
              
            </div>
          </>
          :
          <Form onSubmit={(e : React.FormEvent<HTMLFormElement>)=>{
            e.preventDefault();
            if (modalType==="add")addNewLoc()
            else updateLoc()

            return '';}}>
          <div className='w-full flex flex-col gap-2 mt-4'>
            <div className="flex items-center gap-2 text-sm w-full">
                <div className="font-semibold text-gray-600 w-15">
                    Name: 
                </div>
                <Input className="p-2 border" containerClassName="w-50 max-w-fit" value={selectedLocation?.name} onChange={(e)=>setSelectedLocation({id: selectedLocation?.id??'', name: e.target.value, address: selectedLocation?.address??'', notes: selectedLocation?.notes})} placeholder='Enter a location name...' required={true} validateMode='onSubmit'/>
            </div>

            <div className="flex items-center gap-2 text-sm w-full">
                <div className="font-semibold text-gray-600 w-16">Address: </div>
                {/* <Input className="py-1 px-3 border-1" containerClassName="w-64"/> */}

                {<AddressAutocomplete value={selectedLocation?.address} onChange={(e)=>setSelectedLocation({id: selectedLocation?.id??'', name: selectedLocation?.name??'', address: e, notes: selectedLocation?.notes})}/>}
            </div>
          
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Notes:</p>
              <textarea className="text-gray-500 font-normal text-sm border-2 border-gray-500 bg-gray-100 rounded-md min-w-full p-2 min-h-[72px] resize-none focus:outline-0" placeholder="Add notes to the location here..." value={selectedLocation?.notes}  onChange={(e)=>setSelectedLocation({id: selectedLocation?.id??'', name: selectedLocation?.name??'', address: selectedLocation?.address??'', notes: e.target.value})}></textarea>
            </div>

            <div className='flex items-center justify-end gap-4 -mb-4 mt-4'> 
              <Button type="outline" fontSize="0.8em" onClick={(e)=>setOpenModal(false)}>Cancel</Button>
              <Button type="cta" htmlType='submit' fontSize="0.8em" className="py-3 px-5">{modalType==="add"?"Add":"Update"}</Button>
              
            </div>

          </div>
          </Form>
          }          
        </Modal>}
      </main>
    </div>
    </Layout>
    
  );
};

export default LocationsPage;
