
import instance from "./axiosInstance.js";  // ✅ instance 사용



// 채팅방 생성
export const createChatRoom = async (roomType, capacity, matchedGender, ageGroup) => {
    try {
        const response = await instance.post(`/api/chat/rooms`, { roomType, capacity, matchedGender, ageGroup });
        return response.data;
    } catch (error) {
        console.error("채팅방 생성 중 오류 발생:", error.response?.data || error.message);
        throw error;     // ← 반드시 던져서 호출 측에서 잡을 수 있도록
    }
};

/**
 * 🎯 방 찾기 또는 생성 (통합 API)
 */
export const findOrCreateChatRoom = async (params) => {
    try {
        console.log('🔍 [API] 방 찾기/생성 요청:', params);

        const response = await instance.post('/api/chat/rooms/find-or-create', params);

        console.log('✅ [API] 방 찾기/생성 성공:', {
            action: response.data.action,
            roomId: response.data.room._id,
            attemptedRooms: response.data.attemptedRooms
        });

        return response.data;
    } catch (error) {
        console.error('❌ [API] 방 찾기/생성 실패:', error);
        throw error;
    }
};


// 친구와 채팅방 생성
export const createFriendRoom = async (roomType, capacity) => {
    try {
        const response = await instance.post(`/api/chat/friend/rooms`, { roomType, capacity });
        return response.data;
    } catch (error) {
        console.log("친구와 채팅방 생성 중 오류 발생", error);
    }
};

// 채팅 리스트
export const fetchChatRooms = async (params = {}) => {
    try {
        const response = await instance.get(`/api/chat/rooms`, { params });
        console.log(`🏛️ [방목록] 조회 성공: ${response.data.length}개`);
        return response.data;
    } catch (error) {
        console.error("채팅방 목록을 불러오는 중 오류 발생:", error);
        throw error; // ❌ 빈 배열 대신 에러 던지기
    }
};


// 특정 채팅방 정보 가져오기
export const getChatRoomInfo = async (roomId) => {
    try {
        const response = await instance.get(`/api/chat/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        console.error("해당 채팅방 정보 불러오는 중 오류 발생:", error);
        return [];
    }
};

// 채팅 메세지 불러오기 (사용자 인증 포함)
export const fetchMessages = async (roomId, page = 1, limit = 20, userId = null) => {
    try {
        const params = { page, limit };
        
        // 사용자 ID가 있으면 권한 확인을 위해 포함
        if (userId) {
            params.userId = userId;
        }
        
        const response = await instance.get(`/api/chat/messages/${roomId}`, {
            params: params
        });
        
        console.log(`📨 [메시지조회] ${roomId}방 메시지 ${response.data.messages?.length || 0}개 로드`);
        return response.data;
    } catch (error) {
        console.error("메시지를 불러오는 중 오류 발생:", error);
        // Return an object with empty messages and default pagination on error
        return { messages: [], pagination: { hasNextPage: false } };
    }
};

// 채팅 메세지 전송
export const sendMessage = async (roomId, sender, text) => {
    try {
        const response = await instance.post(`/api/chat/messages`, {
            chatRoom: roomId,
            sender,
            text,
        });
        return response.data;
    } catch (error) {
        console.error("메시지를 전송하는 중 오류 발생:", error);
    }
};

// 채팅 삭제
export const deleteMessage = async (messageId) => {
    try {
        const response = await instance.put(`/api/chat/messages/${messageId}`);
        return response.data;
    } catch (error) {
        console.error("메시지 삭제 중 오류 발생:", error);
        throw error; // 오류가 발생하면 throw하여 catch로 넘어가도록 함
    }
};

// 사용자 참가 (성별 선택 정보 포함)
export const joinChatRoom = async (roomId, userId, selectedGender = null) => {
    try {
        const requestData = { userId };
        
        // 🔧 selectedGender가 있으면 포함해서 전송
        if (selectedGender) {
            requestData.selectedGender = selectedGender;
        }
        
        const response = await instance.post(`/api/chat/rooms/${roomId}/join`, requestData);
        console.log("채팅방 참가 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("채팅방 참가 오류:", error);
        throw error;
    }
};

// 채팅방 나가기 시 참여자에서 제거
export const leaveChatRoom = async (roomId, userId) => {
    try {
        const response = await instance.delete(`/api/chat/rooms/${roomId}/${userId}`);
        return response.data;
    } catch (error) {
        console.error("❌ leaveChatRoom API 오류:", error);
        throw error;
    }
};

// 사용자가 종료한 채팅방 ID 목록을 가져오는 함수
export const fetchUserLeftRooms = async (userId) => {
    try {
        const response = await instance.get(`/api/chat/leftRooms/${userId}`);
        return response.data.leftRooms; // 예를 들어, [roomId1, roomId2, ...]
    } catch (error) {
        console.error("사용자 종료 채팅방 목록 불러오는 중 오류 발생:", error);
        throw error;
    }
};

export const toggleFriendRoomActive = async (roomId, active) =>
    instance.patch(`/api/chat/rooms/${roomId}/active`, { active })
        .then(res => res.data);

export const fetchChatRoomHistory = async (params = {}) => {
    try {
        const response = await instance.get(`/api/chat/search/chat-room-history`, { params });
        return response.data.dtoList || [];
    } catch (error) {
        console.error("채팅방 히스토리 불러오는 중 오류 발생:", error);
        return [];
    }
};

// 1. 메시지 읽음 처리
export const markRoomAsRead = async (roomId, userId) => {
    try {
        const response = await instance.patch(`/api/chat/rooms/${roomId}/read`, {
            userId: userId
        });

        return {
            success: true,
            readAt: response.data.readAt || Date.now(),
            modifiedCount: response.data.modifiedCount || 0
        };
    } catch (error) {
        console.error("메시지 읽음 처리 중 오류 발생:", error);
        throw error;
    }
};

// 2. 안읽은 메시지 개수 조회
export const getUnreadCount = async (roomId, userId) => {
    try {
        const response = await instance.get(`/api/chat/rooms/${roomId}/unread`, {
            params: { userId: userId }
        });

        return {
            unreadCount: response.data.unreadCount || 0
        };
    } catch (error) {
        console.error("안읽은 메시지 개수 조회 중 오류 발생:", error);
        return { unreadCount: 0 };
    }
};

// 3. 채팅방 입장 시간 기록
export const recordRoomEntry = async (roomId, userId) => {
    try {
        const response = await instance.post(`/api/chat/rooms/${roomId}/entry`, {
            userId: userId,
            entryTime: new Date().toISOString()
        });

        // 입장과 동시에 읽음 처리
        await markRoomAsRead(roomId, userId);

        return {
            success: true,
            entryTime: response.data.entryTime || Date.now()
        };
    } catch (error) {
        console.error("채팅방 입장 시간 기록 중 오류 발생:", error);
        throw error;
    }
};

