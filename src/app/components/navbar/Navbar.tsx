import "./css/page.css"
import UserLineIcon from "remixicon-react/UserLineIcon"

export default function Navbar() {
    return (
        <section className="navbar">
            <div className="logo" >
                <div className="bounce-wrap">
                    <img src="/images/school.png" alt="Logo" />
                </div>
                <p>Portal Absensi</p>
            </div>
        </section>
    )
}