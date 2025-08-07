import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import React, {useState} from 'react';

function FormDemo() {
  
  const [formResult, setFormResult] = useState({email:'', password:'', description:''});

  // Use these approach if all data is captured through an input element
  const handleChange = ({ target } : React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> ) => {
 
    const {name, value} = target;
    setFormResult((prev) => ({
      ...prev, [name] : value
    }));
  };

  const handleSubmit = (e : React.FormEvent<HTMLFormElement> ) => {
    e.preventDefault();
    alert(JSON.stringify(formResult, null, 2));
    return '';
  };
 
  // Have these sort of approach if otherwise
  // Utilize useState if you want to access the value directly
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   alert(`Email: ${email}\nPassword: ${password}`);
  // };

  // TODO: Make sure handleSubmit shows up even with elements that adopts internal value

  return (
    <div className="w-72 m-auto border rounded-2xl p-6">
      <h1 className="text-xl font-bold mb-4">Form</h1>
    <Form onSubmit={handleSubmit}>
      <Input name="email" label="Email" type="email" value={formResult.email}
        onChange={handleChange} validateMode="onSubmit" required/>

      <Input type="password" name="password" label="Password" required minLength={6} maxLength={20} value={formResult.password} onChange={handleChange} customValidate={(val : string) =>
          !/[A-Z]/.test(val)
            ? "Password must contain at least one uppercase letter."
            : ""
        }
        validateMode='onBlur'
      />


        {/* Could use internal value, no need to pass in useState variables */}
        {/* <Input label="Description" name="description" validateMode='onSubmit' minLength={20}/> */}

      <Input label="Description" name="description" validateMode='onSubmit' onChange={handleChange} value={20} minLength={20}/>
      <Button type='cta' htmlType='submit' fontSize="0.9em">Submit</Button>
    </Form>
    </div>

  );
}

export default FormDemo;