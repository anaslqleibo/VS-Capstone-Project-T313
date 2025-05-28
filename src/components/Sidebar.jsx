import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaEnvelope, FaUser } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
  <img src="/logo.png" alt="2 Bent Rods" className="logo-img" />
</div>

      <nav>
        <NavLink to="/home" activeclassname="active"><FaHome /> Home</NavLink>
        <NavLink to="/unavailability" activeclassname="active"><FaCalendarAlt /> Unavailability</NavLink>
        <NavLink to="/messaging" activeclassname="active"><FaEnvelope /> Messaging</NavLink>
        <NavLink to="/account" activeclassname="active"><FaUser /> Account</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
