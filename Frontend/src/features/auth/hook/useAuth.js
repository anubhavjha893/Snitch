import { setLoading, setUser } from "../state/auth.slice"
import { register, login, getMe } from "../service/auth.api"
import { useDispatch, useStore } from "react-redux"
import { mergeGuestCart } from "../../guest/mergeGuestCart"



export const useAuth = () => {

    const dispatch = useDispatch()
    const store = useStore()

    async function handleRegister({ email, contact, password, fullname, isSeller = false }) {

        const data = await register({ email, contact, password, fullname, isSeller })

        dispatch(setUser(data.user))
        await mergeGuestCart(store)

        return data.user
    }

    async function handleLogin({ email, password }) {

        const data = await login({ email, password })
        dispatch(setUser(data.user))
        await mergeGuestCart(store)
        return data.user
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            console.log(err)
        } finally {
            dispatch(setLoading(false))
        }
    }

    return { handleRegister, handleLogin, handleGetMe }

}