import "./css/page.css"
import UserLineIcon from "remixicon-react/UserLineIcon"

export default function Navbar() {
    return (
        <section className="navbar">
            <div className="logo" >
                <div className="bounce-wrap">
                    <img src="/images/school.png" alt="Logo" />
                </div>
                <a href="/"><p>Portal Absensi</p></a>
            </div>
            <div className="menu"><li><a href="/dashboard"><UserLineIcon className="user" /></a></li></div>
        </section>
    )
}