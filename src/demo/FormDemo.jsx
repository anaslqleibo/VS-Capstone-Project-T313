import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import {useState} from 'react';

function FormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        name="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        validateMode="onSubmit"
        required
      />
         <Input
        type="password"
        name="password"
        label="Password"
        required
        minLength={6}
        maxLength={20}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        customValidate={(val) =>
          !/[A-Z]/.test(val)
            ? "Password must contain at least one uppercase letter."
            : ""
        }
        validateMode='onBlur'
      />

      <Button type='cta' htmlType='submit' fontSize="0.9em">Submit</Button>
    </Form>

  );
}

export default FormDemo;