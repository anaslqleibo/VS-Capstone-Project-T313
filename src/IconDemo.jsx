import Icon from './assets/icons/Icons';

function IconDemo() {
    const icons = ["calendar-empty", "calendar-filled", "calendar-add","calendar-tick","calendar-remove","calendar-cancel","warning","forbidden","history","search","arrow-up","arrow-down","arrow-left","arrow-right","list","preferences","more","plus","image","location","chat","trash","chart","settings","refresh",""];

     return (
    <div className="p-4">
      <div className="grid grid-cols-6 gap-4">
        {icons.map((icon, index) => (
          <div key={index} className="flex items-center justify-center p-2 border rounded shadow-sm">
            <Icon id={icon} />
          </div>
        ))}
      </div>
    </div>
  );
  }
  
  export default IconDemo;
  