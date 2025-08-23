
import { PageProps } from '../App';
import Layout from '../components/Layout';
import { InputIcon } from '../components/Input';

const LocationsPage = ({modalContainer}:PageProps) => {
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

  return (
    <Layout modalContainer={modalContainer}>
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Locations</h1>
      
      <div className="flex h-screen">

      <main className="w-full bg-[#f9f9fb]">
        <InputIcon placeholder="Search locations..." type="search" icon="search" className='w-full mt-5'/>

        <div className='p-6'>
          {councils.map((council, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-semibold mb-[10px] text-[#273469]">{council.title}</h3>
              <div className="flex flex-wrap gap-2.5">
                {council.locations.map((loc, idx) => (
                  <button key={idx} className="px-2 py-4 text-sm rounded-lg  border-gray-400
                  bg-gray-300 cursor-pointer ease-in duration-200 text-black hover:bg-[#273469] hover:text-white">
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
    </Layout>
    
  );
};

export default LocationsPage;
