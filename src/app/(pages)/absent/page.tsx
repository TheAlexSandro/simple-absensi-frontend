import "./css/page.css";

export default function Absent() {
    return (
        <section className="main">
            <section className="portal">
                <div className="description">
                    <img src="/images/school.png" alt="Gambar Sekolah" />
                    <span>Portal Absensi</span>
                    <p>Selamat datang di portal absensi SMKN 1 Blitar, pindai barcode pada kartu ID Anda kepada barcode scanner untuk presensi.</p>
                </div>
                <form method="POST">
                    <input type="text" placeholder="ID Card Anda..." />
                </form>
            </section>
        </section>
    )
}