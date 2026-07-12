"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {

    try {

      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        

      const token =
        await credential.user.getIdToken();
        localStorage.setItem("token", token);

      console.log(token);

      alert("Logged In!");

    } catch (e) {

      console.log(e);

      alert("Login Failed");
    }

  }

  return (

    <div>

      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={login}>
        Login
      </button>

    </div>

  );

}