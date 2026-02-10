import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Routes from './routes';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes />
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;