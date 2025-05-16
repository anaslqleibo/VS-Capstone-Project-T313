import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import {useState} from 'react';

function FormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <Form onSubmit={() => alert("Submitted!")}>
      <Input
        name="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        validateMode="onSubmit"
        validate={(val) => {
          if (!val) return "Required";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email";
          return null;
        }}
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
        validateMode='onChange'
      />

      <Button type='cta' htmlType='submit' fontSize="0.9em">Submit</Button>
    </Form>

  );
}

export default FormDemo;