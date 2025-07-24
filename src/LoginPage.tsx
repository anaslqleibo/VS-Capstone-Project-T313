import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  const [error, setError] = useState('');

  const handleLogin = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // mock login
    setError('Password or email is incorrect');
  };

  return (
    <div className="login-container">
      {error && <div className="error">{error}</div>}
      <form className="login-form" onSubmit={handleLogin}>
        <img src="/logo.png" alt="2 Bent Rods" className="logo-img" />
        <h2>Employee login</h2>
        <label>Email</label>
        <input type="email" placeholder="Email" required />
        <label>Password</label>
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
