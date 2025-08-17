// import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectAuthUser } from "../redux/user/userSlice";
import { selectMessages, selectSelectedUser, getMessages, selectIsMessagesLoading, subscribeToMessages, unsubscribeFromMessages } from "../redux/chat/chatStorer";

const ChatContainer = () => {

  const messages = useAppSelector(selectMessages);
  const dispatch = useAppDispatch();
  const messageEndRef: any = useRef(null);
  const selectedUser = useAppSelector(selectSelectedUser);
  const isMessagesLoading = useAppSelector(selectIsMessagesLoading);
  const authUser = useAppSelector(selectAuthUser);

  useEffect(() => {
    console.log("selectedUser", selectedUser);
    if(selectedUser) dispatch(getMessages(selectedUser._id));

    dispatch(subscribeToMessages());

    return () => { dispatch(unsubscribeFromMessages())};
  }, [selectedUser]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                {/* <img
                  src={
                    message.senderId === authUser?._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                /> */}
                <div className="avatar avatar-placeholder">
                  {(message.senderId === authUser?._id) && (
                    <div className="bg-neutral text-neutral-content w-10 rounded-full" style={{backgroundColor: authUser?.color}}>
                      <span className="text-md">{authUser?.fullName?.trim().charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {(message.senderId !== authUser?._id) && (
                    <div className="bg-neutral text-neutral-content w-10 rounded-full" style={{backgroundColor: selectedUser?.color}}>
                      <span className="text-md">{selectedUser?.fullName?.trim().charAt(0).toUpperCase()}</span>
                    </div>
                  )}

                </div>
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex flex-col ${message.senderId === authUser?._id ? "chat-bubble-primary" : ""}` }>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
