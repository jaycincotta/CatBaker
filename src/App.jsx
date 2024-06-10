import "./styles.css";
import CatBaker from "./assets/CatBaker.png";
import Tester from "./Starter1/Tester";

export default function App() {
  return (
    <div className="App">
      <div className="App-header">
        <img
          src={CatBaker}
          alt="Cat Baker"
          style={{ width: "128px", height: "128px" }}
        />
        <div className="App-title">
          We're cooking up the successor to CatMaker!
        </div>
      </div>
      <Tester />
    </div>
  );
}
