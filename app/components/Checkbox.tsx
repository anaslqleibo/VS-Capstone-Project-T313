

type CheckboxProps = {
    label: string;
    checked: boolean;
    onChange: (e: boolean) => void;
    className?: string;
};

export default function Checkbox({ label, checked, onChange, className }: CheckboxProps) {
  return (
    <div className={className}>
      <label className={`flex items-center space-x-2 cursor-pointer ${checked ? 'font-medium text-gray-900' : 'font-normal text-gray-700'}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e)=>onChange(e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>

    </div>
    
  );
}