import React, {useEffect, useState} from "react";
import login from './login.module.css'
import {redirect} from "next/dist/server/api-utils";
import {useRouter} from "next/router";

export default function Login(req, res) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    function authorize() {
        fetch('/api/auth/login', {
            method: 'post',
            body: JSON.stringify({
                email: email,
                password: password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async r => {
            if (r.status === 200)
            {
                if (router.query.return)
                {
                    await router.push(router.query.return as string);
                    return;
                }
                await router.push('/user');
            }
        });
    }

    return (
        <div className={login.loginForm}>
            <a className={login.profileAvatar}/>
            <div className={login.inputRow}>
                <a className={login.icon && login.email}/>
                <input value={email} onChange={e => setEmail(e.target.value)}
                       type='email' placeholder="Enter your email address"/>
            </div>
            <div className={login.inputRow}>
                <a className="icon password"/>
                <input value={password} onChange={e => setPassword(e.target.value)}
                       type='password' placeholder="Enter your password"/>
            </div>

            <button onClick={authorize}>Login</button>
            <p className={login.noAccount}>Don't have an account? Ok.</p>
        </div>
    );

}