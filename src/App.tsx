import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppraisalPage } from '@/pages/AppraisalPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { HistoryDetailPage } from '@/pages/HistoryDetailPage';
import { HistoryComparePage } from '@/pages/HistoryComparePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppraisalPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<HistoryDetailPage />} />
        <Route path="/history/compare" element={<HistoryComparePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
