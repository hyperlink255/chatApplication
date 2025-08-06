import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
export const ChatContext = createContext()
export const ChatProvider = ({children}) => {
    const [message,setMessages] = useState([])
    const [users,setUsers] = useState([])
    const [selectedUser,setSelectedUser] = useState(null)
    const [unseenMessages,setUnseenMessages] = useState({})

    const {socket,axios} = useContext(AuthContext)

    const getUsers = async () => {
        try{
            const res = await axios.get("/api/messages/users");
            if(res.status === 200){
                setUsers(res.data.users)
                setUnseenMessages(res.data.unseenMessages)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const getMessages = async (userId) => {
        try{
            const res = await axios.get(`/api/messages/${userId}`)
            if(res.status === 200){
                setMessages(res.data.messages)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const sendMessage = async (messageData) => {
      try{
         const res = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
         if(res.status === 200){
            setMessages((prevMessages) => [...prevMessages,res.data.newMessage])
         }else{
            toast.error(res.data.message)
         }
      }catch(error){
         toast.error(error.message)
      }
    }

    const subscribeToMessages = async () => {
        if(!socket) return;
        socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){
               newMessage.seen = true;
               setMessages((prevMessages) => [...prevMessages,newMessage]);
               axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages) => ({
                     ...prevUnseenMessages,[newMessage.senderId] :
                      prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages
                      [newMessage.setMessages] + 1 : 1
                }))
            }
        })
    }

    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage")
    }
    useEffect(() => {
    subscribeToMessages()
    return () => unsubscribeFromMessages();
    },[socket,selectedUser])

    const value = {
     message,users,selectedUser,getUsers,getMessages,sendMessage,
     setSelectedUser,unseenMessages,setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

