import axios from 'axios';

const host = `${import.meta.env.VITE_API_HOST}/api/reportNotification`;

// 로그인한 사용자의 미확인 알림 조회 함수
export const fetchNotifications = async (userId) => {
    try {
        const response = await axios.get(`${host}/${userId}`, {
            withCredentials: true,
        });
        // 서버의 응답에서 알림 리스트가 data.data에 있다고 가정합니다.
        return response.data.data;
    } catch (error) {
        throw new Error('알림을 불러오지 못했습니다.');
    }
};

// 알림 읽음 처리를 위한 함수
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.patch(`${host}/${notificationId}`, {}, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw new Error('알림 상태 업데이트에 실패했습니다.');
    }
};

// 알림 읽음 후 즉시 삭제 처리를 위한 함수
export const markNotificationAsReadAndDelete = async (notificationId) => {
    try {
        const response = await axios.patch(`${host}/${notificationId}/delete`, {}, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw new Error('알림 삭제 상태 업데이트에 실패했습니다.');
    }
};
