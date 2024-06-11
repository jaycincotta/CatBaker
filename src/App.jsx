import "./styles.css";
import CatBaker from "./assets/CatBaker.png";
import UserProfile from "./Login/UserProfile";
import AppProvider from "./Context/AppProvider";
import Navigation from "./Navigation";
import CategoryBuilder from "./Starter1/CategoryBuilder";

export default function App() {
  return (
    <AppProvider>
      <div className="App">
        <div className="App-header">
          <img
            src={CatBaker}
            alt="Cat Baker"
            style={{ width: "128px", height: "128px" }}
          />
          <Navigation />
          <UserProfile />
        </div>
        <CategoryBuilder />
      </div>
    </AppProvider>
  );
}
