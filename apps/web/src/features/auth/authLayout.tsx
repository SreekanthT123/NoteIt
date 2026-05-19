// import { Login } from "./Login";
// import { Signup } from "./Signup";
// import { useState } from "react";

// export const AuthLayout = () => {
//   const [newUser, setNewUser] = useState(false);
//   return (
//     <div className="flex flex-col items-center justify-center gap-4 h-full">
//       <div>Already have an account</div>
//       <button onClick={() => setNewUser(false)}>Login</button>
//       <button onClick={() => setNewUser(true)}>Signup</button>

//       {/*if login is selected, show login form. if signup is selected, show signup form */}
//       {newUser ? <Signup /> : <Login />}
//     </div>

//   );
// };
import { GalleryVerticalEnd } from "lucide-react";
import { Login } from "./Login";

export function AuthLayout({ onAuth }: any) {
  return (
    <>
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&family=DM+Mono&display=swap');
       
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .35; transform: scale(1.55); }
        }
        @keyframes float {
          0%, 100% { transform: perspective(1100px) rotateY(-8deg) rotateX(3deg) translateY(0px); }
          50% { transform: perspective(1100px) rotateY(-8deg) rotateX(3deg) translateY(-10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: perspective(1100px) rotateY(8deg) rotateX(-3deg) translateY(0px); }
          50% { transform: perspective(1100px) rotateY(8deg) rotateX(-3deg) translateY(-10px); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-1%,-1%); }
          30% { transform: translate(1%,-2%); }
          50% { transform: translate(-1%,1%); }
          70% { transform: translate(2%,1%); }
          90% { transform: translate(-2%,2%); }
        }

        .grain-overlay::after {
          content: '';
          position: fixed;
          inset: -200%;
          width: 400%; height: 400%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 999;
        }

        .grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(#cfcfcf 1px, transparent 1px),
            linear-gradient(90deg, #cfcfcf 1px, transparent 1px);
          background-size: 64px 64px;
        }


        /* Button hover */
        .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
        .btn-ghost:hover { border-color: #3a3a5a; color: #aaa; }
        .footer-btn:hover { background: #9a8fff; }

        /* Feature card transition */
        .feature-card { transition: border-color .3s ease, transform .3s ease; }

        /* Step card */
        .step-card { transition: border-color .3s ease; }
      `}</style>
    
    <div className="grid grid-cols-1 min-h-[calc(100vh-84px)]  ">
      <div className="flex flex-col gap-4 p-6 md:p-10 ">
        {/* <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Note!t.inc
          </a>
        </div> */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Login onAuth={onAuth} />
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
}
