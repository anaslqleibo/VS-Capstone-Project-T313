import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import {useState} from 'react';

function FormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  // Utilize useState if you want to access the value directly
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  // TODO: Make sure handleSubmit shows up even with elements that adopts internal value

  return (
    <div className="w-72 m-auto border rounded-2xl p-6">
      <h1 className="text-xl font-bold mb-4">Form</h1>
    <Form onSubmit={handleSubmit}>
      <Input name="email" label="Email" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} validateMode="onSubmit" required/>

      <Input type="password" name="password" label="Password" required minLength={6} maxLength={20} value={password} onChange={(e) => setPassword(e.target.value)} customValidate={(val : string) =>
          !/[A-Z]/.test(val)
            ? "Password must contain at least one uppercase letter."
            : ""
        }
        validateMode='onBlur'
      />


        {/* Could use internal value, no need to pass in useState variables */}
      <Input label="Description" textarea minLength={20} validateMode='onChange'/>
      <Button type='cta' htmlType='submit' fontSize="0.9em">Submit</Button>
    </Form>
    </div>

  );
}

export default FormDemo;