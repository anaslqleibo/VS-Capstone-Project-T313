import Input from '../components/Input';
import { InputIcon } from '../components/Input';
import Dropdown from '../components/Dropdown';

function InputDemo() {
    return (
        <div>
            <form>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-8 ">
                  <Input placeholder="Name" label="Name" required className="mb-5 w-32"/>
                  <Input placeholder="abd@gmail.com" label="Email" className="mb-5 w-fit"/>
                  <Input placeholder="No Label" className="mb-5 w-fit"/>
                  <InputIcon placeholder="Search" type="search"/>
                  <InputIcon placeholder="Pay" type="icon left filled" icon="$"/>
                  <InputIcon placeholder="Pay" type="icon right filled" icon="$"/>
                  <InputIcon placeholder="Pay" type="icon right" icon="$"/>
                  <Input placeholder="Write a comment" textarea className="w-64"/>
                  
                  <Dropdown
                    items={['John', 'Kevin', 'Jane', "Tommy", "Sonny", "Smith", "Naomi", "Evan"]}
                    multiple={true}
                    showCheckbox={true}
                    placeholder="Select employees"
                  />
                </div>
              </div>
                

            </form>

            
            
        </div>
    );
  }
  
export default InputDemo;
  