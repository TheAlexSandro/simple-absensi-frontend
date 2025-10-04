"use client"
import { useEffect, useState } from "react";
import "./css/page.css";
import { api } from "@/lib/api";
import Loader4Line from "remixicon-react/Loader4LineIcon";
import { toast } from "react-toastify";

export default function Signin() {
    const [inputID, setInputID] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        api("/generateAuthToken", null, null, (error, token) => {
            api("/verify", token["result"], null, (err, result) => {
                if (err) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); return }
                if (result["ok"]) return window.location.href = "/dashboard";
                setShowContent(true);
            })
        })
    }, [])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signin();
    }

    const signin = () => {
        setLoading(true);
        if (!inputID || !inputPassword) { toast.warning("ID dan password tidak boleh kosong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return; }
        api("/generateAuthToken", null, null, (error, token) => {
            api("/signin", token["result"], { id: inputID, password: inputPassword }, (err, result) => {
                if (!result["ok"] && result["error_code"] == "USER_NOT_FOUND") { toast.error("Pengguna tidak ada.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }
                if (!result["ok"] && result["error_code"] == "UNAUTHORIZED_ACCESS") { toast.error("Kata sandi salah untuk pengguna ini.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }
                if (err || !result["ok"]) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

                window.location.href = "/dashboard";
            })
        })
    }

    return (
        <>
            {showContent && (
                <section className="main">
                    <section className="signin">
                        <div className="description">
                            <img src="/images/school.png" alt="Gambar Sekolah" />
                            <span>Portal Absensi</span>
                            <p>Masuk ke akun Anda untuk melihat rekapan absensi Anda.</p>
                        </div>
                        <form method="POST" onSubmit={handleSubmit}>
                            <label htmlFor="id">ID Anda</label>
                            <input type="text" id="id" value={inputID} onChange={(e) => setInputID(e.target.value.replace(/\s+/g, ''))} placeholder="Masukkan ID Anda..."/>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value.replace(/\s+/g, ''))} placeholder="Masukkan kata sandi..." />

                            {!loading && (
                                <button type="submit">Masuk</button>
                            )}
                            {loading && (
                                <div className="loading">
                                    <Loader4Line className="icon" />
                                </div>
                            )}
                        </form>
                    </section>
                </section>
            )}
        </>
    )
}