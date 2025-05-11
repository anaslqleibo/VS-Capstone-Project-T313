import Button from './components/Button/Button';
import Icon from './assets/icons/Icons';

function ButtonDemo() {
    const tasks = ["Task 1", "Task 2", "Task 3"];
    function testClick(){
        alert("test!");
    }
    return (
        <div>
            <Button type='cta' onClick={testClick}>Start Shift</Button>
            <Button type='text'>Location 1</Button>
            <Button type='outline'>Delete Shift</Button>
            <Button type='toggle'/>
            <Button type='dropdown' items={tasks}/>
            <Button type='icon'><Icon id="settings" /></Button>
            <Button type='icon outline'><Icon id="list" /></Button>

            <Button type='fab'><Icon id="plus"/></Button>
            <Button type='cta' onClick={testClick} disabled>Comment</Button>
        </div>
    );
  }
  
  export default ButtonDemo;
  