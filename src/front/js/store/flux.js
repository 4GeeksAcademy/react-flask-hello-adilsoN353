const apiUrl = process.env.BACKEND_URL + "/api";
const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            demo: [
                { title: "FIRST", background: "white", initial: "white" },
                { title: "SECOND", background: "white", initial: "white" },
            ],
            token: null,
            userinfo: null,
        },
        actions: {
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },
            getMessage: async () => {
                try {
                    const resp = await fetch(apiUrl + "/hello");
                    const data = await resp.json();
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.log("Error loading message from backend", error);
                }
            },
            changeColor: (index, color) => {
                const store = getStore();
                const demo = store.demo.map((elm, i) => {
                    if (i === index) elm.background = color;
                    return elm;
                });
                setStore({ demo: demo });
            },
            login: async (email, password) => {
                let resp = await fetch(apiUrl + "/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                    headers: { "Content-Type": "application/json" },
                });
                console.log(resp.status);
                if (!resp.ok) {
                    setStore({ token: null });
                    return false;
                }
                let data = await resp.json();
                setStore({ token: data.token });
                localStorage.setItem("token", data.token);
                return true;
            },
            loadSession: async () => {
                let storageToken = localStorage.getItem("token");
                if (!storageToken) return;
                setStore({ token: storageToken });
                let resp = await fetch(apiUrl + "/userinfo", {
                    headers: { Authorization: "Bearer " + storageToken },
                });
                if (!resp.ok) {
                    setStore({ token: null });
                    localStorage.removeItem("token");
                    return false;
                }
                let data = await resp.json();
                setStore({ userInfo: data });
                return true;
            },
            logout: async () => {
                let { token } = getStore();
                let resp = await fetch(apiUrl + "/logout", {
                    method: "POST",
                    headers: { Authorization: "Bearer " + token },
                });
                if (!resp.ok) return false;
                setStore({ token: null, userInfo: null });
                localStorage.removeItem("token");
                return true;
            },
        },
    };
};

export default getState;
