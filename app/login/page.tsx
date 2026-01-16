"use client";
import React, { useEffect, useState } from 'react';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';
import Toast from '@/app/components/Toast';
import Form from '@/app/components/Form';
import Image from "next/image";
import logo from '@/public/LOGO.png';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchApi } from '../lib/api';

const LoginPage = () => {
  const [formData, setFormData] = useState<{email: string, password: string}>({email: '', password: ''})  
  const [error, setError] = useState('');
  const [shown, setShown] = useState(false);

  const { login, isAuthenticated } = useAuth();


  const handleChange = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = target;
    setFormData((prev)=>({
      ...prev, [name] : value
    }))
  }

  const setCookie = (name: string, value: string, days: number = 7) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      const cookieValue = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      document.cookie = cookieValue;
      console.log('Cookie set:', name, value);
  };
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log('Attempting login...');
      const response = await fetchApi("/auth/login", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              email: formData.email,
              password: formData.password,
          }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
          throw new Error(data.error || "Login failed");
      }

      // Login successful
      console.log("Login successful:", data);
      
      // Store token in localStorage and cookies
      if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Also store in cookies for middleware access
          setCookie("authToken", data.token, 7);
          console.log('Token stored, redirecting to homepage...');
          
          // Update auth context
          login(data.token, data.user);
      }
      
      // Redirect to homepage after successful login
      // If API returned user.role, use that; otherwise decode JWT payload as fallback.
      const role: "admin" | "user" | undefined =
        data?.user?.role ??
        (() => {
          try {
            return JSON.parse(atob(data.token.split(".")[1]))?.role;
          } catch {
            return undefined;
          }
        })();

      // Use full page reload so middleware picks up the new cookie immediately
      window.location.href = role === "admin" ? "/portal" : "/home";
      
    } catch (error) {
        console.error("Login failed:", error);
        setError("Password or email is incorrect");
        setShown(true);
    } 
  };

  //  useEffect(() => {
  //       if (isAuthenticated) {
  //           redirect("/portal");
  //       }
  //   }, [isAuthenticated, router]);


    // push them to the correct landing based on stored role
    useEffect(() => {
      if (!isAuthenticated) return;

      try {
        const storedUser = localStorage.getItem("user");
        const role: "admin" | "user" | undefined = storedUser
          ? JSON.parse(storedUser).role
          : undefined;

        // full replace to avoid back nav to /login
        window.location.replace(role === "admin" ? "/portal" : "/home");
      } catch {
        window.location.replace("/home");
      }
    }, [isAuthenticated]);
  

    
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[color:#f3f4f8]">
      <Toast message={error} type="error" shown={shown} setShown={setShown}/>

      <Form className="bg-white p-7 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] w-[80%] md:w-[30%] text-center" onSubmit={handleLogin} showToast={setShown} setToastMessage={setError}>
        <Image src={logo} alt="2 Bent Rods Logo" className="w-24 m-auto"/>
        <h2 className='mb-4 text-[color:var(--primary-color)] text-xl font-bold'>Employee Login</h2>
    
        <Input placeholder='Email' name="email" label='Email' type='email' required value={formData.email} onChange={handleChange} validateMode='onSubmit'/>
        <Input placeholder='Password' name="password" label='Password' type="password" required value={formData.password} onChange={handleChange} validateMode='onSubmit' allowViewPassword={true}/>
        <Button htmlType='submit' className='w-[80%] md:w-1/2 mx-auto mt-4'>Login</Button>
      </Form>
    </div>
  );
};

export default LoginPage;
