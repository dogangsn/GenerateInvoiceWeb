import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CountrySelect } from './views/CountrySelect';
import { Dashboard } from './views/Dashboard';
import { InvoiceList } from './views/InvoiceList';
import { Reports } from './views/Reports';
import { Customers } from './views/Customers';
import { CreateInvoice } from './views/CreateInvoice';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.COUNTRY_SELECT);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.COUNTRY_SELECT:
        return <CountrySelect onSelect={() => setCurrentView(ViewState.DASHBOARD)} />;
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.INVOICES:
        return <InvoiceList />;
      case ViewState.REPORTS:
        return <Reports />;
      case ViewState.CUSTOMERS:
        return <Customers />;
      case ViewState.CREATE_INVOICE:
        return <CreateInvoice />;
      default:
        return <Dashboard />;
    }
  };

  if (currentView === ViewState.COUNTRY_SELECT) {
    return renderContent();
  }

  return (
    <div class="flex h-screen w-full bg-background-light text-slate-800">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main class="h-screen flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;