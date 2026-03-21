import Header from "../components/Header";
import FormCard from "../components/FormCard";
import "../styles/global.css";
import "./Home.css";

export default function Home() {
    return (
        <>
        <Header />
        <main className="container">
            <FormCard />
        </main>
        </>
    );
}