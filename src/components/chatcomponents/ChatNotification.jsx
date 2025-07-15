// src/components/GlobalChatNotification.jsx
import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useFriendChatStore from "../../stores/useFriendChatStore";
import useNotificationStore from "../../stores/notificationStore.js";
import DropdownTransition from '../../layout/css/DropdownTransition.jsx';

const GlobalChatNotification = () => {
    const socket = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const userId = user?._id;

    // 드롭다운용
    const [dropdownOpen, setDropdownOpen] = useState(false);


    // ② 알림 외부 클릭 감지용 useEffect -> 내부 눌러도
    useEffect(() => {
        if (!dropdownOpen) return;

        const handleClickOutside = (e) => {
            // ref.current가 정의되어 있고, 클릭한 타겟이 그 영역 안에 없으면
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        // 드롭다운이 열렸을 때만 리스너 등록
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);



    // 토스트용
    const [toasts, setToasts] = useState([]);
    const dropdownRef = useRef(null);

    const { openFriendChat } = useFriendChatStore();
    const notifications = useNotificationStore((state) => state.notifications);
    const addNotification = useNotificationStore((state) => state.addNotification);
    const removeNotificationsByRoom =useNotificationStore((state) => state.removeNotificationsByRoom);

    useEffect(() => {
        if (socket && userId) {
            socket.emit("register", userId);
        }
    }, [socket, userId]);

    useEffect(() => {
        if (!socket) return;
        const handler = (data) => {
            if (location.pathname.startsWith(`/chat/${data.chatRoom}`)) return;
            const id = Date.now();
            const newNotif = { id, ...data };
            // 드롭다운 목록에 추가
            addNotification(newNotif);
            // 토스트에도 추가
            setToasts((prev) => [...prev, newNotif]);
            // 5초 뒤 토스트만 제거
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 5000);
        };
        socket.on("chatNotification", handler);
        return () => {
            socket.off("chatNotification", handler);
        };
    }, [socket, location, addNotification]);

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    const handleNotificationClick = (notif) => {
        // 클릭 시 채팅방 이동
        if (notif.roomType === "random") {
            navigate(`/chat/${notif.chatRoom}/${userId}`);
        } else {
            const friendInfo = notif.friend || {
                _id: notif.message.sender.id,
                nickname: notif.message.sender.nickname,
            };
            openFriendChat({ roomId: notif.chatRoom, friend: friendInfo });
        }
        removeNotificationsByRoom(notif.chatRoom);
        setToasts((prev) => prev.filter((t) => t.chatRoom !== notif.chatRoom));
        //setDropdownOpen(false);
    };

    const renderRoomTypeTag = (roomType) => {
        if (roomType === "random") return "[랜덤] ";
        if (roomType === "friend") return "[친구] ";
        return "";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 토스트 알림 */}
            <div className="fixed top-16 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg max-w-xs"
                    >
                        {renderRoomTypeTag(toast.roomType)}
                        {toast.notification}
                    </div>
                ))}
            </div>

            {/* 벨 아이콘 + 드롭다운 */}
            <button
                onClick={toggleDropdown}
                className="relative bg-transparent border-0 cursor-pointer text-2xl">
                  <span role="img" aria-label="notification">
                    🔔
                  </span>
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white text-xs px-1">
                      {notifications.length}
                    </span>
                    )}
            </button>

            <DropdownTransition
               show={dropdownOpen}
               as="div"
               className="absolute top-full right-0 bg-white text-black shadow-lg rounded z-[1000] w-[250px] max-h-[300px] overflow-y-auto"
            >
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                            >
                                {renderRoomTypeTag(notif.roomType)}
                                {notif.notification}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            알림이 없습니다
                        </div>
                    )}
            </DropdownTransition>

        </div>
    );
};

export default GlobalChatNotification;
