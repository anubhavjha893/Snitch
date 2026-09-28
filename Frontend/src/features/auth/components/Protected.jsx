import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router'

const Protected = ({ children, role = null }) => {

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
    const location = useLocation()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />
    }

    if (role && user.role !== role) {
        return <Navigate to="/" />
    }

    return children

}

export default Protected