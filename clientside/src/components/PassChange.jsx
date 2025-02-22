import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./PassChange.scss"
import { useNavigate } from 'react-router-dom';
import url from '../assets/url';
const PassChange = () => {
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [cpwd, setCpwd] = useState('');

    const Navigate=useNavigate()
    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handlePassChange = async (e) => {
        e.preventDefault();
        try {
         const res=   await axios.post(`${url}/passchange`, {email, pwd, cpwd   });
            if (res.status==200) {
              Navigate("/login")  
              localStorage.removeItem("email")
            }else{
                alert("something went wrong")
            }

        } catch (error) {
            
        }
    };

    const handleLogin = () => {
        window.location.href = '/login';
    };

    return (
        <div className="passchange-container">
            <form className="passchange-form" onSubmit={handlePassChange}>
                <h2 className="passchange-title">Change Password</h2>
                <div className="passchange-field">
                    <label className="passchange-label" htmlFor="pwd">New Password:</label>
                    <input
                        type="password"
                        id="pwd"
                        className="passchange-input"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        required
                    />
                </div>
                <div className="passchange-field">
                    <label className="passchange-label" htmlFor="cpwd">Confirm New Password:</label>
                    <input
                        type="password"
                        id="cpwd"
                        className="passchange-input"
                        value={cpwd}
                        onChange={(e) => setCpwd(e.target.value)}
                        required
                    />
                </div>
                <div className="passchange-buttons">
                    <button type="submit" className="passchange-button">Change Password</button>
                    <button type="button" className="passchange-login-button" onClick={handleLogin}>Login</button>
                </div>
            </form>
        </div>
    );
};

export default PassChange;
