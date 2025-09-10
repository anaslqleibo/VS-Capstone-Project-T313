export default function Spinner(){
    return (
        <div className="flex justify-center items-center absolute top-1/2 left-1/2 -translate-1/2">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[color:var(--primary-color)]"></div>
        </div>
    );
}