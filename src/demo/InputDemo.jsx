import Icon from '../assets/icons/Icons';
import Input from '../components/Input';
import Button from '../components/Button';

function InputDemo() {
function validateLength(str) {
  return str.length >= 5; // Example: input must be at least 5 characters
}
    return (
        <div>
            <form>

                <Input placeholder="Name"/>
                <Input placeholder="Name" required/>
                <Input placeholder="Search" type="search"/>
                <Input placeholder="Pay" type="icon left filled" icon="$"/>
                <Input placeholder="Pay" type="icon right filled" icon="$"/>
                <Input placeholder="Pay" type="icon right" icon="$"/>
                <Input placeholder="Write a comment" type="textarea"/>
                <input type="submit"/>
            </form>

            
            
        </div>
    );
  }
  
export default InputDemo;
  