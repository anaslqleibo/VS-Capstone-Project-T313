import React from 'react';
import Sidebar from '../components/Sidebar';
import './LocationsPage.css';
import { PageProps } from '../App';
import Layout from '../components/Layout';

const LocationsPage = ({modalContainer, rootRef}:PageProps) => {
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
    <Layout modalContainer={modalContainer} rootRef={rootRef}>
      <div className="dashboard-container">

      <main className="main-content">
        <h1>
          Welcome, <span className="highlight-name">Naomi</span>
        </h1>

        <div className="location-search-box">
          <input type="text" placeholder="Search locations..." />
        </div>

        <div className="location-sections">
          {councils.map((council, index) => (
            <div key={index} className="council-block">
              <h3>{council.title}</h3>
              <div className="location-grid">
                {council.locations.map((loc, idx) => (
                  <button key={idx} className="location-button">
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
