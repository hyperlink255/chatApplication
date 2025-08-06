import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import {io} from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKENF_URL;
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
    const [token,setToken] = useState(localStorage.getItem("token"))
    const [authUser,setAuthUser] = useState(null)
    const [onlineUsers,setOnlineUsers] = useState([])
    const [socket,setSocket] = useState(null)


    const checkAuth = async () => {
        try{
        const res =  await axios.get("/api/auth/check")
        if(res.status === 200){
            setAuthUser(res.data.user)
            conncetSocket(res.data.user)
        }
        }catch(error){
            toast.error(error.message)
        }
    }

 
    const login = async (state,credentials) => {
        try{
            const res = await axios.post(`/api/auth/${state}`, credentials);
            if(res.status ===  200){
               setAuthUser(res.data.userData)
               conncetSocket(res.data.userData)
               axios.defaults.headers.common['token'] = res.data.token
               setToken(res.data.token) 
               localStorage.setItem("token",res.data.token)
               toast.success(res.data.message)
            }else{
              toast.error(res.data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const logout = async () => {
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common["token"] = null
        toast.success("Logged out successfully")
        socket.disconnect()
    }

    const updateProfile = async(body) => {
        try{
           const {data} = await axios.put("/api/auth/update-profile",body);
           if(data.success === 200){
            setAuthUser(data.user)
            toast.success("Profile updated successfully")
           }
        }catch(error){
          toast.error(error.message)
        }
    }


    const conncetSocket = (userData) => {
        if(!userData || socket?.connected) return
        const newSocket = io(backendUrl,{
            query:{
                userId:userData._id
            }
        })
        newSocket.connect()
        setSocket(newSocket)
        newSocket.on("getOnlineUsers",(userIds) => {
            setOnlineUsers(userIds)
        })
    }

    useEffect(() => {
      if(token){
        axios.defaults.headers.common["token"] = token
      }
      checkAuth()
    },[])

    const value = {
       axios,
       authUser,
       onlineUsers,
       socket,
       login,
       logout,
       updateProfile
    }

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}