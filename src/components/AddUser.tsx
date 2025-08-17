import { Link } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
import { Loader2, LogOut, MessageSquare, Settings, User, User2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addContact, logout, selectAuthUser } from "../redux/user/userSlice";
import { useState } from "react";
import { getUsers } from "../redux/chat/chatStorer";
const AddUser = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

    const authUser = useAppSelector(selectAuthUser);
    const dispatch = useAppDispatch();

    // Handle form submission
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
        // TODO: Replace this with your actual API call to add a contact
        // Example:
        // await addContact({ userId: authUser._id, contactUsername: username });

        console.log(`Adding user with username: ${username}`);
        

        // Optionally, you can dispatch an action to update your Redux store
        await dispatch(addContact({ userId: authUser?._id, contactUsername: username }));
        await dispatch(getUsers());
        // Reset the form and close the modal on success
        setUsername("");
        } catch (error) {
        // Handle errors (e.g., show an error message to the user)
        console.error("Failed to add user:", error);
        } finally {
        setLoading(false);
        }
    };

  return (
    <dialog id="addUser" className="modal">
        <div className="modal-box">
            <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="text-lg font-bold">Add User</h3>
            <form onSubmit={handleSubmit}>            
                <div className="form-control">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                    </div>
                
                    <input
                        type="text"
                        className={`input input-bordered w-full pl-10`}
                        placeholder="johndoe123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                
                </div>
                </div>
                <div className="modal-action">
                    <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !username}
                    >
                    {loading ? <Loader2 className="animate-spin" /> : "Add"}
                    </button>
                </div>
          </form>
        </div>
    </dialog>
  );
};
export default AddUser;
