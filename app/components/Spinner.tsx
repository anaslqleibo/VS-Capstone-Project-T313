type SpinnerProps = {
    custom?: boolean;
}

type CustomSpinnerProps = {
    simplified?:boolean;
    borderSpinner?:boolean;
    showWater?:boolean;
    backgroundGradient?:boolean;    
}
export function CustomSpinner({simplified, borderSpinner, showWater, backgroundGradient, ...props}: CustomSpinnerProps) {
  return ( 
    <div className={`relative w-[150px] h-[150px] rounded-full ${backgroundGradient ? 'from-primary to-hover bg-gradient-to-tl' : (simplified?'': 'bg-primary')} flex justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden`}>
    { (borderSpinner || simplified) && <div className={`absolute inset-0 z-40 top-50% rounded-full border-white ${ backgroundGradient ? 'border-t-primary border-6' : (simplified?'border-t-primary border-10': 'border-t-hover border-6')} animate-[spin_1s_ease-in-out_infinite]`}></div>}
    
        {/* Fishing Rod */}
        <div className={`absolute z-20 rounded-[10px] ${simplified?'bg-primary':'bg-[#333]'}`} style={{
            bottom: "30px",
            left: "37px",
            width: "110px",
            height: "7px",
            transform: "rotate(-60deg)",
            transformOrigin: "left center",
          }}
        ></div>

        {/* Fishing Line */}
        <div
          className={`absolute rounded-full ${simplified?'bg-primary':'bg-white'}`}
          style={{
            top: "22px",
            left: "91px",
            width: "3px",
            height: "400px",
            animation: "reel 3s ease-in-out infinite",
            transformOrigin: "top",
          }}
        ></div>

        {/* Reel */}
        <div
          className={`reel absolute z-30 rounded-full border-[3px] ${simplified?'border-primary':'border-[#A9A9A9]'}`}
          style={{
            top: "75px",
            left: "47px",
            width: "18px",
            height: "18px",
          }}
        >
          {/* Handle */}
          <div
            className={`handle absolute rounded-full z-4 ${simplified?'bg-primary':'bg-[#A9A9A9]'}`}
            style={{
              top: "50%",
              left: "50%",
              width: "20px",
              height: "3px",
              transformOrigin: "1.5px center",
              animation: "spin-reel 3s ease-in-out infinite",
            }}
          ></div>
        </div>

        {/* Fish */}
        <div
          className={`fish absolute ${simplified?'bg-primary':'bg-[#B0C4DE]'}`}
          style={{
            bottom: "10px",
            left: "85px",
            width: "15px",
            height: "25px",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            animation: "bob 3s ease-in-out infinite",
          }}
        ></div>

        {/* Water */}
        {showWater && !simplified && <div className="water absolute bottom-0 left-0 w-full h-[25px] bg-[rgba(30,144,255,0.7)] rounded-t-full z-10 overflow-hidden"></div>}

              {/* Pseudo-elements and animations */}
      <style>
        {`

          ${!simplified ? 
          `
          .reel::after{
            content: ""; 
            z-index: 3;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            width: 9px;
            height: 9px;
            border: 2px solid white;
            box-sizing: border-box;
            border-radius: 100%;
          }` : ''
          }
          

          .handle::after {
            content: "";
            position: absolute;
            right: 0;        
            top: 100%;
            transform: translateY(-100%);
            width: 3px;
            height: 8px;
            background: ${simplified ? 'var(--color-primary)':'#A9A9A9'};
            border-radius: 2px;
          }

          .fish::after {
            content: "";
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: -7px;
            width: 12px;
            height: 10px;
            background: ${simplified ? 'var(--color-primary)':'#B0C4DE'};
            clip-path: polygon(50% 0, 0 100%, 100% 100%);
            border-radius: 2px;
            transform-origin: 50% 0;
            animation: tail-wag 0.25s ease-in-out infinite;
          }

          .water::before {
            content: "";
            position: absolute;
            top: -10px; 
            left: 0;
            width: 200%;
            height: 20px;
            background: rgba(30, 144, 255, 0.7);
            border-radius: 50%;
            animation: wave 3s ease-in-out infinite;
          }

          @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-50%); }
          }

          @keyframes bob {
            0%, 100% { transform: translateY(55px); }
            50% { transform: translateY(-50px); }
          }

          @keyframes reel {
            0%, 100% { height: 150px; }
            50% { height: 50px; }
          }

          @keyframes tail-wag {
            0%, 100% { transform: translateX(-50%) rotate(-15deg); }
            50%      { transform: translateX(-50%) rotate(15deg); }
          }

          @keyframes spin-reel {
            0%, 100%   { transform: translate(-1.5px, -50%) rotate(0deg); }
            50% { transform: translate(-1.5px, -50%) rotate(720deg); }
          }
        `}
      </style>
    </div>
  );
}



export default function Spinner({custom, ...props}:SpinnerProps & CustomSpinnerProps){
    const spinner = custom ? <CustomSpinner {...props}/>
    : <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>;

    return (
    <div className="flex justify-center items-center absolute top-1/2 left-1/2 -translate-1/2">
        {spinner}
    </div>
    );
    
}