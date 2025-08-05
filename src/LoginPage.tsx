import React, { useState } from 'react';
// import './LoginPage.css';
import Input from './components/Input';
import Button from './components/Button';
import Toast from './components/Toast';
import Form from './components/Form';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [login, setLogin] = useState<{email: string, password: string}>({email: '', password: ''})
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [shown, setShown] = useState(false);


  const handleChange = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = target;
    setLogin((prev)=>({
      ...prev, [name] : value
    }))
  }

  const handleLogin = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (login.password === "what"){
      nav('/home');
      return '';
    }
    else return 'Password or email is incorrect, Clue: what is the password';
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[color:#f3f4f8]">
      <Toast message={error} type="error" shown={shown} setShown={setShown}/>

      <Form className="bg-white p-7 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] w-[80%] md:w-[40%] text-center" onSubmit={handleLogin} showToast={setShown} setToastMessage={setError}>
        <img src="/logo.png" alt="2 Bent Rods" className="w-24 m-auto" />
        <h2 className='mb-4 text-[color:var(--primary-color)] text-xl font-bold'>Employee Login</h2>
    
        <Input placeholder='Email' name="email" label='Email' type='email' required value={login.email} onChange={handleChange} validateMode='onSubmit'/>
        <Input placeholder='Password' name="password" label='Password' type="password" required value={login.password} onChange={handleChange} validateMode='onSubmit' allowViewPassword={true}/>
        <Button htmlType='submit' className='w-[80%] md:w-1/2 mx-auto mt-4'>Login</Button>
      </Form>
    </div>
  );
};

export default LoginPage;
