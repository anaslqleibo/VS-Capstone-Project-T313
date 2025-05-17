import Input from '../components/Input';
import { InputIcon } from '../components/Input';
import Dropdown from '../components/Dropdown';

function InputDemo() {
    return (
        <div>
            <form>

                <Input placeholder="Name"/>
                <Input placeholder="Name" required/>
                <InputIcon placeholder="Search" type="search"/>
                <InputIcon placeholder="Pay" type="icon left filled" icon="$"/>
                <InputIcon placeholder="Pay" type="icon right filled" icon="$"/>
                <InputIcon placeholder="Pay" type="icon right" icon="$"/>
                <Input placeholder="Write a comment" type="textarea"/>
                
                <Dropdown
                  items={['John', 'Kevin', 'Jane', "Tommy", "Sonny", "Smith", "Naomi", "Evan"]}
                  multiple={true}
                  showCheckbox={true}
                  placeholder="Select employees"
                />

            </form>

            
            
        </div>
    );
  }
  
export default InputDemo;
  