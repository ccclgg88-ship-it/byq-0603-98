import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppraisalPage } from '@/pages/AppraisalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppraisalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
