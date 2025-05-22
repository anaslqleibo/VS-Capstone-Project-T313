import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from './assets/LOGO.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      navigate('/dashboard');
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <img src={logo} alt="2 Bent Rods logo" className="login-logo" />
        <h2>Employee login</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
