import './App.css';
import Inputs from './components/Inputs';
import ShowData from './components/ShowData';

function App() {
  return (
    <div className="App">
      <div className="app-container">
        <div className="left-panel">
          <Inputs />
        </div>
        <div className="right-panel">
          <ShowData />
        </div>
      </div>
    </div>
  );
}

export default App;
