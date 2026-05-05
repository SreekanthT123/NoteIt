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
    <div className="grid grid-cols-1 min-h-[calc(100vh-84px)]">
      <div className="flex flex-col gap-4 p-6 md:p-10 ">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Note!t.inc
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Login onAuth={onAuth} />
          </div>
        </div>
      </div>
    </div>
  );
}
