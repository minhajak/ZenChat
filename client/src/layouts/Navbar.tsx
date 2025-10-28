import { Link, Outlet } from "react-router-dom";
import {
  LogOut,
  MessageSquare,
  MessageSquareCode,
  Settings,
  User,
} from "lucide-react";
import { useStoreAuth } from "../store/useStoreAuth";


const Navbar = () => {
  const { logout, authUser } = useStoreAuth();
 


  return (
    <>
      <header
        className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg "
      >
        <div className=" mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold">ZenChat</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={"/theme"}
                className={`
              btn btn-sm gap-2 transition-colors
              
              `}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Themes</span>
              </Link>

              {authUser && (
                <>
                  <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <Link to={"/friends"} className={`btn btn-sm gap-2`}>
                    <MessageSquareCode className="size-5" />
                    <span className="hidden sm:inline">Friends</span>
                  </Link>

                  <button
                    className="flex  items-center btn btn-ghost btn-sm gap-2"
                    onClick={logout}
                  >
                    <LogOut className="size-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="pt-15">
        <Outlet />
      </div>
    </>
  );
};
export default Navbar;
