"use client"
import React, { useState, useEffect } from "react";
import "./page.css";
import AlertLineIcon from "remixicon-react/AlertLineIcon";
import Loader4Line from "remixicon-react/Loader4LineIcon";
import { api } from "@/lib/api";

interface Absensi {
    nama: string,
    jabatan: string,
    absen: {
        id: string,
        waktu: string,
        status: string
    }[]
}

export default function Home() {
    const [input, setInput] = useState<string>("");
    const [isMobile, setIsMobile] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [changeLayout, setChangeLayout] = useState<boolean>(false);
    const [datas, setDatas] = useState<Absensi>({ nama: "", jabatan: "", absen: [] });
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768 || (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.devicePixelRatio > 1)
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        absensi(input);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D+/g, "");
        setInput(value);
        if (value.length == 9) return absensi(value);
    };

    const reload = () => {
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    const absensi = (code: string) => {
        setChangeLayout(true);
        setLoading(true);
        api("/generateAuthToken", null, null, (error, r_t) => {
            if (error) { setIsError(true); setErrorMessage("Something went wrong."); setChangeLayout(true); setLoading(false); reload(); return }
            api("/absen", r_t['result'], { id: code }, (err, result) => {
                if (err || !result['ok']) {setIsError(true); setErrorMessage("Pengguna tidak ada."); setChangeLayout(true); setLoading(false); setInput(""); reload(); return }
                setDatas(result['result']);
                setLoading(false);
            })
        })
    };

    const lastAbsen = datas.absen[datas.absen.length - 1] || {};
    return (
        <section className="main">
            {!isMobile && (
                <section className="portal">
                    {!changeLayout && <>
                        <div className="description">
                            <img src="/images/school.png" alt="Gambar Sekolah" />
                            <span>Portal Absensi</span>
                            <p>Selamat datang di portal absensi SMKN 1 Blitar, pindai barcode pada kartu ID Anda kepada barcode scanner untuk presensi.</p>
                        </div>
                        <form method="POST" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={input}
                                onChange={handleChange}
                                autoFocus
                                className="border p-2"
                                placeholder="Pindai kartu Anda..."
                            />
                        </form>
                    </>}
                    {changeLayout && (<>
                        {loading && (
                            <div className="loading">
                                <Loader4Line className="icon" />
                            </div>
                        )}
                        {!loading && !isError && (
                            <div className="result">
                                <div className="description">
                                    <img src="/images/school.png" alt="Gambar Sekolah" />
                                    <span>Portal Absensi</span>
                                    <p>Anda berhasil melakukan absen di absensi SMKN 1 Blitar.</p>
                                </div>
                                <div className="item">
                                    <span className="sub">Nama</span>
                                    <span>{datas.nama || ""}</span>
                                </div>
                                <div className="item">
                                    <span className="sub">Jabatan</span>
                                    <span>{datas.jabatan || ""}</span>
                                </div>
                                <div className="item">
                                    <span className="sub">Waktu</span>
                                    <span>{lastAbsen.waktu}</span>
                                </div>
                                <div className="item">
                                    <span className="sub">Status</span>
                                    <span>{lastAbsen.status}</span>
                                </div>
                            </div>
                        )}
                        {isError && (
                            <div className="result">
                                <div className="description">
                                    <img src="/images/school.png" alt="Gambar Sekolah" />
                                    <span>Portal Absensi</span>
                                    <p>Anda berhasil melakukan absen di absensi SMKN 1 Blitar.</p>
                                </div>
                                <div className="error">
                                    <AlertLineIcon className="icon"/>
                                    <span>{errorMessage}</span>
                                    <small>Page will be reload in 3 seconds.</small>
                                </div>
                            </div>
                        )}
                    </>)}
                </section>
            )}

            {isMobile && (
                <section className="warning">
                    <AlertLineIcon className="icon" />
                    <span>Unauthorized!</span>
                    <p>Perangkat tidak diizinkan untuk melakukan pemindaian.</p>
                </section>
            )}
        </section>
    )
}