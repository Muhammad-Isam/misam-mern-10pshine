import React, { useState } from "react";
import './AuthorisationForm.css';

export default function AuthorisationForm() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="container">
      <div className="form-container">
        <div className="form-toggle">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>
        {isLogin ? (
          <div className="form">
            <h2 className="heading">Login Form</h2>
            <div className="input-container">
              <i className="fa fa-user icon"></i>
              <input type="email" placeholder="User Email" />
            </div>
            <div className="input-container">
              <i className="fa fa-key icon"></i>
              <input type="password" placeholder="User Password" />
            </div>
            <label>
              <input type="checkbox" />Remember me
            </label>
            <a href="#">Forgot Password</a>
            <button>Submit</button>
          </div>
        ) : (
          <div className="form">
            <h2 className="heading">Signup Form</h2>
            <input type="text" placeholder="User Name" />
            <input type="Age" placeholder="User Age" />
            <input type="email" placeholder="User Email" />
            <input type="Contact" placeholder="User Contact" />
            <input type="password" placeholder="User Password" />
            <input type="password" placeholder="Confirm Password" />
            <button>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}
