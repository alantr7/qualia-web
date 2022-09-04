import React, { useEffect, useReducer, useState } from "react";

const initialState = {
    user: {
        id: '',
        username: '',
        drive: {
            used: '0',
            capacity: '0'
        }
    },
    isLoggedIn: false
};


const AuthStateContext = React.createContext(initialState);
const AuthDispatchContext = React.createContext(null);

function reducer(currentState, newState) {
    return { ...currentState, ...newState };
}

function useAuth() {
    return React.useContext(AuthStateContext);
}

function useAuthDispatch() {
    return React.useContext(AuthDispatchContext);
}

function AuthProvider(props) {

    const [state, dispatch] = React.useReducer(reducer, initialState);

    const [isLoggedIn, setLoggedIn] = useState(false);

    const auth = useAuth();

    if (!auth.isLoggedIn && !isLoggedIn) {
        if (props.user) {
            console.log(props.user);

            dispatch({
                user: props.user,
                isLoggedIn: true
            });

            setLoggedIn(true);
        } else {
            useEffect(() => {
                fetchUser(dispatch).then(() => {
                    setLoggedIn(true);
                });
            }, [false]);
        }
    }

    return <AuthStateContext.Provider value={state}>
        <AuthDispatchContext.Provider value={dispatch}>
            {isLoggedIn && props.children}
            {!isLoggedIn && <p>Logging in...</p>}
        </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
}

async function fetchUser(dispatch) {
    const response = await fetch('/api/v1/user');
    const user = await response.json();

    dispatch({
        user
    });
}

export { AuthProvider, useAuth, useAuthDispatch };