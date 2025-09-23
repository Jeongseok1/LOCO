import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithKakao } from '../../api/authAPI.js';
import useAuthStore from "../../stores/authStore.js";
import useNotificationStore from "../../stores/notificationStore.js";
import useReactivationStore from "../../stores/useReactivationStore.js";

const LoginHandler = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");

    const { setUser } = useAuthStore();
    const { syncWithUserPrefs } = useNotificationStore();
    const { triggerReactivation } = useReactivationStore();

    useEffect(() => {
        if (!code) return;
        (async () => {
            try {
                const data = await loginWithKakao(code);
                if (data.status === 'noUser') {
                    // 서버 세션에 소셜 데이터가 저장되므로 바로 이동
                    navigate('/signupPage');
                } else if (data.status === 'success') {
                    setUser(data.user);
                    await syncWithUserPrefs({
                        friendReqEnabled: data.user.friendReqEnabled ?? true,
                        chatPreviewEnabled: data.user.chatPreviewEnabled ?? true,
                    });
                    navigate('/');
                } else if (data.status === 'reactivation_possible') {
                    triggerReactivation(data.user, data.socialData);
                    navigate('/');
                }
            } catch (err) {
                console.error('카카오 로그인 처리 에러:', err);
                alert(err.response?.data?.message || err.message);
                navigate('/');
            }
        })();
    }, [code, navigate, setUser, syncWithUserPrefs, triggerReactivation]);

    return <div>로그인 처리 중...</div>;
};

export default LoginHandler;
