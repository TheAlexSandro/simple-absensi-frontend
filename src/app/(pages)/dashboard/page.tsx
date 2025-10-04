"use client"
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import "./css/page.css";
import UserAddLine from "remixicon-react/UserAddLineIcon";
import UserUnfollowLine from "remixicon-react/UserUnfollowLineIcon";
import User from "remixicon-react/UserLineIcon";
import ArrowLeftLine from "remixicon-react/ArrowLeftLineIcon";
import Loader4Line from "remixicon-react/Loader4LineIcon";
import Barcode from "@/app/components/barcode/Barcode";
import PrinterLine from "remixicon-react/PrinterLineIcon";
import LogoutBoxLine from "remixicon-react/LogoutBoxLineIcon";
import Swal from "sweetalert2";

type User = {
    user_id: string;
    data: {
        user_id: string;
        nama: string;
        jabatan: string;
        absent: any[];
    };
};

export default function Dashboard() {
    const [showDashboard, setShowDashboard] = useState(false);
    const [showPanel, setShowPanel] = useState(true);
    const [showAllUser, setShowAllUser] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showDelUser, setShowDelUser] = useState(false);

    const [role, setRole] = useState("");
    const [nama, setNama] = useState("");
    const [id, setID] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showBarcode, setShowBarcode] = useState("");
    const barcodeRef = useRef<SVGSVGElement | null>(null);
    const [userList, setUserList] = useState<User[]>([]);
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        api("/generateAuthToken", null, null, (error, token) => {
            if (error) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); return }
            api("/verify", token["result"], null, (err, result) => {
                if (err) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); return }
                if (!result["ok"]) return window.location.href = "/signin";
                setShowDashboard(true);
            })
        })
    }, [])

    const handlePrint = (user_id: string, nama: string, role: string) => {
        const printContent = document.getElementById(`line-${user_id}`)?.innerHTML;
        if (!printContent) return;

        const printWindow = window.open("", "_blank", `width=${screen.width},height=${screen.height},top=0,left=0`);
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(`
      <html>
        <head>
          <title>${showBarcode} - ${nama}_${role}</title>
          <style>
            @page {
                size: A4 landscape;
                margin: 0;
            }
            body {
                font-family: Arial, sans-serif;
                top: 50%;
                left: 50%;
                position: absolute;
                transform: translate(-50%, -50%) scale(2.5);
            }
            svg {
                max-width: 100%;
            }
            .description {
                padding: 0 10px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
            .description span {
                font-size: 9px;
            }
          </style>
        </head>
        <body onload="window.print();">
        <div class="description">
            <span>CODE-128 FORMAT</span>
            <span>${nama.toUpperCase()} - ${role.toUpperCase()}</span>
        </div>
          ${printContent}
        </body>
      </html>
    `);
        printWindow.document.close();
    }

    const changeLayout = (type: string) => {
        setShowPanel(false);
        if (type == "add_user") { setShowAddUser(true) };
        if (type == "list_user") { setShowAllUser(true); fetchUsers() };
        if (type == "del_user") { setShowDelUser(true); fetchUsers() };
    }

    const returns = () => {
        setShowPanel(true);
        setShowBarcode("");
        setID("");
        setNama("");
        setRole("");
        setShowAddUser(false);
        setShowAllUser(false);
        setShowDelUser(false);
    }

    const handleAddUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (id && (id.length < 9 || id.length > 9)) return toast.warning("Minimal dan maksimal panjang id adalah 9 angka.", { position: "top-right", autoClose: 5000, closeOnClick: true });
        setLoading(true);
        api("/generateAuthToken", null, null, (error, token) => {
            if (error) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }
            const ops = id ? { nama, jabatan: role, id } : { nama, jabatan: role };
            api("/register", token["result"], ops, (err, result) => {
                if (err) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }
                if (!result["ok"]) { toast.dismiss(); toast.warning(result["message"], { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

                toast.dismiss();
                toast.success("Berhasil!", { position: "top-right", autoClose: 5000, closeOnClick: true });
                setShowBarcode(result["result"]["user_id"]);
                setLoading(false);
            })
        })
    }

    const fetchUsers = () => {
        setLoadingUser(true);
        api("/generateAuthToken", null, null, (error, token) => {
            if (error) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

            api("/getAllUser", token["result"], null, (err, result) => {
                if (err) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }
                if (!result["ok"]) { toast.dismiss(); toast.warning(result["message"], { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

                setUserList(result["result"]);
                setLoadingUser(false);
            })
        })
    }

    const hapusUser = (user_id: string, nama: string) => {
        if (clicked) return;
        Swal.fire({
            icon: "warning",
            title: "Konfirmasi",
            text: `Apa Anda yakin ingin menghapus pengguna - ${nama.toUpperCase()}`,
            showCancelButton: true,
            showConfirmButton: true
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setClicked(true);
                    toast.info("Memproses...", { position: "top-right", autoClose: 5000, closeOnClick: true });
                    api("/generateAuthToken", null, null, (error, token) => {
                        if (error) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

                        api("/removeUser", token["result"], { id: user_id }, (err, result) => {
                            if (err) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }
                            if (!result["ok"]) { toast.warning(result["message"], { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

                            toast.dismiss();
                            toast.success("Berhasil!", { position: "top-right", autoClose: 5000, closeOnClick: true });
                            setClicked(false);
                            fetchUsers();
                        })
                    })
                }
            })
    }

    const logout = () => {
        Swal.fire({
            icon: "warning",
            title: "Konfirmasi",
            text: `Apa Anda yakin ingin keluar dari admin?`,
            showCancelButton: true,
            showConfirmButton: true
        })
            .then((result) => {
                if (result.isConfirmed) {
                    api("/generateAuthToken", null, null, (error, token) => {
                        if (error) { toast.error("Something went wrong.", { position: "top-right", autoClose: 5000, closeOnClick: true }); setLoading(false); return }

                        api("/signOut", token["result"], null, (err, result) => {
                            window.location.href = "/signin";
                        })
                    })
                }
            })
    }

    return (
        <>
            {showDashboard && (
                <section className="main">
                    {showPanel && (
                        <>
                            <div className="description">
                                <span>Selamat datang, admin!</span>
                                <p>Berikut adalah dashboard admin yang dapat Anda kelola, apa yang akan Anda lakukan?</p>
                            </div>

                            <div className="menu">
                                <span className="title">Manajemen Pengguna</span>
                                <div className="container">
                                    <div className="item" onClick={() => { changeLayout("list_user") }}><User className="icon" /> Daftar Pengguna</div>
                                    <div className="item" onClick={() => { changeLayout("add_user") }}><UserAddLine className="icon" /> Tambah Pengguna</div>
                                    <div className="item" onClick={() => { changeLayout("del_user") }}><UserUnfollowLine className="icon" /> Hapus Pengguna</div>
                                </div>

                                <span className="title">Akun</span>
                                <div className="container">
                                    <div className="item" onClick={logout}><LogoutBoxLine className="icon" /> Keluar</div>
                                </div>
                            </div>
                        </>
                    )}

                    {showAllUser && (
                        <section className="submenu">
                            <div className="return" onClick={returns}><ArrowLeftLine className="icon " /></div>
                            <div className="description">
                                <span className="subtitle"><User className="icon" /> Daftar Pengguna</span>
                                <p>Lihat daftar pengguna yang saat ini tersedia.</p>

                                {!loadingUser && (
                                    <div className="users">
                                        <div className="table-container">
                                            <table className="user-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Nama</th>
                                                        <th>Jabatan</th>
                                                        <th>Barcode</th>
                                                        <th>Cetak</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userList.map((u) => (
                                                        <tr key={u.user_id}>
                                                            <td>{u.data.user_id}</td>
                                                            <td>{u.data.nama.toUpperCase()}</td>
                                                            <td>{u.data.jabatan.toUpperCase()}</td>
                                                            <td className="bcd"><div id={`line-${u.user_id}`}><Barcode value={u.user_id} /></div></td>
                                                            <td className="aksi"><button onClick={() => { handlePrint(u.user_id, u.data.nama, u.data.jabatan) }}>Cetak</button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {loadingUser && (
                                    <div className="users">
                                        <div className="loading">
                                            <Loader4Line className="icon" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {showAddUser && (
                        <section className="submenu">
                            <div className="return" onClick={returns}><ArrowLeftLine className="icon " /></div>
                            <div className="description">
                                <span className="subtitle"><UserAddLine className="icon" /> Tambah Pengguna</span>
                                <p>Dari menu ini, Anda dapat menambahkan pengguna baru.</p>
                                <i className="wajib">*) wajib</i>
                            </div>

                            {!showBarcode && (
                                <form onSubmit={handleAddUserSubmit} method="POST">
                                    <label htmlFor="nama">Nama <span className="wajib">*</span></label>
                                    <input type="text" id="nama" placeholder="Ketikkan nama..." value={nama} onChange={(e) => setNama(e.target.value)} required />
                                    <label htmlFor="jabatan">Jabatan <span className="wajib">*</span></label>
                                    <select id="jabatan" onChange={(e) => setRole(e.target.value)} value={role} required>
                                        <option value="">-- pilih salah satu --</option>
                                        <option value="guru">Guru</option>
                                        <option value="staff">Staff</option>
                                        <option value="siswa">Siswa</option>
                                    </select>
                                    <label htmlFor="id">
                                        <div className="info">
                                            ID
                                            <span className="hint">min - maks: 9 angka</span>
                                        </div>
                                    </label>
                                    <input type="text" id="id" placeholder="Masukkan ID Disini" value={id} onChange={(e) => setID(e.target.value.replace(/\D+/g, ''))} inputMode="numeric" />

                                    {!loading && (
                                        <button type="submit">Tambah</button>
                                    )}
                                    {loading && (
                                        <div className="loading">
                                            <Loader4Line className="icon" />
                                        </div>
                                    )}
                                </form>
                            )}

                            {showBarcode && (
                                <section className="barcode">
                                    <div className="description">
                                        <span>CODE-128 FORMAT</span>
                                        <span>{nama.toUpperCase()} - {role.toUpperCase()}</span>
                                    </div>
                                    <section id={`line-${id}`}>
                                        <Barcode
                                            value={showBarcode}
                                            format="CODE128"
                                            height={80}
                                            width={3}
                                            //@ts-ignore
                                            ref={barcodeRef} />
                                    </section>

                                    <div className="button">
                                        <button onClick={() => { handlePrint(id, nama, role) }}><PrinterLine className="icon" /> Cetak</button>
                                    </div>
                                </section>
                            )}
                        </section>
                    )}

                    {showDelUser && (
                        <section className="submenu">
                            <div className="return" onClick={returns}><ArrowLeftLine className="icon " /></div>
                            <div className="description">
                                <span className="subtitle"><UserUnfollowLine className="icon" /> Hapus Pengguna</span>
                                <p>Dari menu ini, Anda dapat menghapus pengguna yang Anda pilih.</p>

                                {!loadingUser && (
                                    <div className="users">
                                        <div className="table-container">
                                            <table className="user-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Nama</th>
                                                        <th>Jabatan</th>
                                                        <th>Barcode</th>
                                                        <th>Cetak</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userList.map((u) => (
                                                        <tr key={u.user_id}>
                                                            <td>{u.data.user_id}</td>
                                                            <td>{u.data.nama.toUpperCase()}</td>
                                                            <td>{u.data.jabatan.toUpperCase()}</td>
                                                            <td className="bcd"><div id={`line-${u.user_id}`}><Barcode value={u.user_id} /></div></td>
                                                            <td className="aksi"><button onClick={() => { hapusUser(u.user_id, u.data.nama) }}>Hapus</button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {loadingUser && (
                                    <div className="users">
                                        <div className="loading">
                                            <Loader4Line className="icon" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </section>
            )}
        </>
    )
}