import Button from '../components/Button';
import Icon from '../assets/icons/Icons';

function ButtonDemo() {
    const tasks = ["Task 1", "Task 2", "Task 3"];
    function testClick(){
        alert("test!");
    }

    const handleItemClicks = [function(){
        alert("Task 1")
    }, function(){
        alert("Task 2")
    },function(){
        alert("Task 3")
    },];

    const onToggleClick = {
        true: function(){alert("True!")},
        false: function(){alert("False!")},
    };

    return (
        <div className="flex flex-wrap gap-8 items-center w-3/4 mx-auto mb-4">
                <Button type='cta' onClick={testClick}>Start Shift</Button>
                <Button type='text'>Location 1</Button>
                <Button type='selectable' onToggleClick={onToggleClick}>Location 2</Button>
                
                <Button type='outline'>Delete Shift</Button>
                <Button type='toggle' onToggleClick={onToggleClick}/>
                <Button type='dropdown' items={tasks} onItemClicks={handleItemClicks}/>
                <Button type='icon'><Icon id="settings" width='2em' height='2em'/></Button>
                <Button type='icon outline'><Icon id="list" width='2em' height='2em'/></Button>

                <Button type='fab'><Icon id="plus" width='15' height='15'/></Button>

                <Button type='cta' fontSize='20px'><Icon id='trash'/> Delete</Button>
                {/* TODO: Sort out icons buttons layout */}

                <Button type='cta' onClick={testClick} disabled>Comment</Button>
            </div>
    );
  }
  
  export default ButtonDemo;
  