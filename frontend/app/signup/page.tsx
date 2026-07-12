"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";


export default function SignupPage() {

  const [email,setEmail]=useState("");

  const [password,setPassword]=useState("");

  async function signup(){

    try{

      const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await credential.user.getIdToken();

await fetch("http://localhost:8000/employees", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    firebase_uid: credential.user.uid,
    name: name,
    email: email,
    phone: phone,
    department_id: departmentId,
  }),
});
      console.log(credential.user.uid);

      alert("Signup Success");

    }catch(e){

      console.log(e);

    }

  }

  return(

    <div>

      <input
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={signup}>
        Signup
      </button>

    </div>

  );

}