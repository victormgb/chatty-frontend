import { Link } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout, selectAuthUser } from "../redux/user/userSlice";
const Navbar = () => {
//   const { logout, authUser } = useAuthStore();

  const authUser = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  }

  const handleModal = () => {
    const addUser = document.getElementById("addUser") as any;
    if(addUser && addUser?.showModal) {
      addUser.showModal();
    }
  }

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link> */}

            {authUser && (
              <>
                <button className="flex gap-2 items-center btn btn-primary" onClick={handleModal}>
                  <User2 className="size-5" />
                  Add User
                </button>
                <button className="flex gap-2 items-center btn" onClick={handleLogout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                {/* <dialog id="addUser" className="modal">
                  <div className="modal-box">
                    <h3 className="text-lg font-bold">Hello!</h3>
                    <p className="py-4">Press ESC key or click the button below to close</p>
                    <div className="modal-action">
                      <form method="dialog">
                        <button className="btn">Close</button>
                      </form>
                    </div>
                  </div>
                </dialog> */}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
