import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectSelectedUser, setSelectedUser } from "../redux/chat/chatStorer";
import { selectOnlineUsers } from "../redux/user/userSlice";

const ChatHeader = () => {
//   const { selectedUser, setSelectedUser } = useChatStore();
//   const { onlineUsers } = useAuthStore();

  const selectedUser = useAppSelector(selectSelectedUser);
  const dispatch = useAppDispatch();
  const onlineUsers = useAppSelector(selectOnlineUsers);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-10 rounded-full" style={{backgroundColor: selectedUser?.color}}>
                <span className="text-md">{selectedUser?.fullName?.trim().charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {(selectedUser && onlineUsers.includes(selectedUser._id)) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => dispatch(setSelectedUser(null))}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
