
import React, { useState } from 'react';
import TaskSidebar from './components/TaskSidebar';
import Header from './components/Header';
import DashboardView from './components/Dashboard';
import DesignHub from './components/DesignHub';
import SolutionDesignView from './components/SolutionDesign';
import StandaloneEstimator from './components/StandaloneEstimator';
import StandaloneArchitecture from './components/StandaloneArchitecture';
import StandaloneDataDictionary from './components/StandaloneDataDictionary';
import StandaloneDataQuality from './components/StandaloneDataQuality';
import StandaloneDataModeler from './components/StandaloneDataModeler';
import ProjectDescriber from './components/ProjectDescriber';
import StandaloneSolutionDocument from './components/StandaloneSolutionDocument';
import StandaloneCaseStory from './components/StandaloneCaseStory';
import CopilotPolicyGenerator from './components/CopilotPolicyGenerator';
import CopilotGlossaryGenerator from './components/CopilotGlossaryGenerator';
import CopilotRaciGenerator from './components/CopilotRaciGenerator';
import LoginPage from './components/LoginPage';
import UserGuide from './components/UserGuide';
import UserProfileModal from './components/UserProfileModal';
import { RequestData, DesignCache, UserProfile, WorkspaceTab, SearchResult } from './types';
import { AlertTriangle } from 'lucide-react';
import { searchAllHistory } from './services/geminiService';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Tab Management State
  const [openTabs, setOpenTabs] = useState<WorkspaceTab[]>([]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  
  // View Mode for deep linking within modules
  const [viewMode, setViewMode] = useState<string | null>(null);
  
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [designCache, setDesignCache] = useState<DesignCache>({});
  const [showGuide, setShowGuide] = useState(false);
  
  // Navigation Guard State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNavigationAlert, setShowNavigationAlert] = useState(false);
  const [pendingTabId, setPendingTabId] = useState<string | null>(null);

  // Global Search State
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // User Profile State
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Architect',
    email: 'alex.arch@data.inc',
    role: 'Senior Solution Architect',
    preferences: {
      defaultProduct: '',
      defaultDeployment: 'Cloud'
    }
  });
  
  // Mock Data
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [nextId, setNextId] = useState(1001);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTabId('dashboard');
    setOpenTabs([]);
  };

  const getModuleLabel = (type: string) => {
      switch(type) {
          case 'design-module': return 'Solution Design';
          case 'project-describer': return 'Project Analysis';
          case 'adhoc-estimator': return 'Estimator';
          case 'policy-generator': return 'Policy Generator';
          case 'glossary-generator': return 'Business Glossary';
          case 'raci-generator': return 'RACI Matrix';
          case 'adhoc-architecture': return 'Blueprint Studio';
          case 'data-modeler': return 'Data Modeler';
          case 'data-dictionary': return 'Metadata Dictionary';
          case 'dq-module': return 'Data Quality';
          case 'solution-doc-pro': return 'Solution Doc Pro';
          case 'case-story': return 'Case Story Deck';
          default: return 'Workspace';
      }
  };

  // Called when creating a new module instance
  const handleSwitchTab = (moduleType: string, mode?: string, data?: any) => {
      if (hasUnsavedChanges) {
          if(!confirm("You have unsaved changes. Discard them?")) return;
          setHasUnsavedChanges(false);
      }

      if (moduleType === 'dashboard') {
          setActiveTabId('dashboard');
          return;
      }

      const newTabId = `tab-${Date.now()}`;
      const newTab: WorkspaceTab = {
          id: newTabId,
          type: moduleType,
          label: `New ${getModuleLabel(moduleType)}`,
          timestamp: Date.now(),
          viewMode: mode as any,
          data: data 
      };

      setViewMode(mode || null);

      setOpenTabs(prev => {
          const current = [...prev];
          if (current.length >= 5) {
              current.shift(); 
          }
          return [...current, newTab];
      });
      setActiveTabId(newTabId);
  };

  // Called when clicking existing sidebar tabs
  const handleActivateTab = (tabId: string) => {
      if (hasUnsavedChanges && tabId !== activeTabId) {
          setPendingTabId(tabId);
          setShowNavigationAlert(true);
          return;
      }
      setActiveTabId(tabId);
      
      const tab = openTabs.find(t => t.id === tabId);
      if (tab) {
          setViewMode(tab.viewMode || null);
      }
  };

  const handleCloseTab = (tabId: string) => {
      if (activeTabId === tabId && hasUnsavedChanges) {
          if(!confirm("Discard changes in this tab?")) return;
          setHasUnsavedChanges(false);
      }

      const newTabs = openTabs.filter(t => t.id !== tabId);
      setOpenTabs(newTabs);

      if (activeTabId === tabId) {
          if (newTabs.length > 0) {
              setActiveTabId(newTabs[newTabs.length - 1].id);
          } else {
              setActiveTabId('dashboard');
          }
      }
  };

  const confirmNavigation = () => {
      if (pendingTabId) {
          setHasUnsavedChanges(false);
          setShowNavigationAlert(false);
          
          if (pendingTabId.includes('|')) {
              const [type, mode] = pendingTabId.split('|');
              setPendingTabId(null);
              handleSwitchTab(type, mode);
          } else {
              if (pendingTabId === 'dashboard') {
                  setActiveTabId('dashboard');
              } else {
                  setActiveTabId(pendingTabId);
              }
              setPendingTabId(null);
          }
      }
  };

  const cancelNavigation = () => {
      setShowNavigationAlert(false);
      setPendingTabId(null);
  };

  const handleCreateSubmit = (newRequest: any) => {
    const requestWithId: RequestData = {
      ...newRequest,
      id: `REQ-${nextId}`,
      status: 'Not Started'
    };
    setRequests([requestWithId, ...requests]);
    setNextId(prev => prev + 1);
    setSelectedRequest(requestWithId);
    
    setOpenTabs(prev => prev.map(t => 
        t.id === activeTabId 
        ? { ...t, label: requestWithId.clientName || 'Untitled Project', type: 'design' }
        : t
    ));
    
    setHasUnsavedChanges(false);
  };

  const handleSelectRequest = (req: RequestData) => {
    if (hasUnsavedChanges) {
        if(!confirm("You have unsaved changes. Discard them?")) return;
        setHasUnsavedChanges(false);
    }
    
    const newTabId = `req-${req.id}`;
    const existing = openTabs.find(t => t.id === newTabId);
    if (existing) {
        setActiveTabId(newTabId);
        setSelectedRequest(req);
        return;
    }

    const newTab: WorkspaceTab = {
        id: newTabId,
        type: 'design',
        label: req.clientName,
        timestamp: Date.now()
    };

    setOpenTabs(prev => {
        const current = [...prev];
        if (current.length >= 5) current.shift();
        return [...current, newTab];
    });
    setActiveTabId(newTabId);
    setSelectedRequest(req);
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
        setRequests(prev => prev.filter(r => r.id !== id));
        if (selectedRequest && selectedRequest.id === id) {
            setSelectedRequest(null);
            const tabId = `req-${id}`;
            handleCloseTab(tabId);
        }
    }
  };

  const handleUpdateDesignCache = (reqId: string, designData: any) => {
    setDesignCache(prev => ({
      ...prev,
      [reqId]: designData
    }));
  };

  const handleUpdateRequestStatus = (reqId: string, status: 'Not Started' | 'In Progress' | 'Completed') => {
      setRequests(prev => prev.map(req => req.id === reqId ? { ...req, status } : req));
      if (selectedRequest && selectedRequest.id === reqId) {
          setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }
  };

  const handleGlobalSearch = (query: string) => {
      const requestResults: SearchResult[] = requests
          .filter(r => r.clientName.toLowerCase().includes(query.toLowerCase()) || r.type.toLowerCase().includes(query.toLowerCase()))
          .map(r => ({
              id: r.id,
              type: 'request',
              title: r.clientName,
              subtitle: `Solution Design • ${r.status}`,
              date: r.date,
              data: r
          }));

      const historyResults = searchAllHistory(query);
      setSearchResults([...requestResults, ...historyResults]);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
      if (hasUnsavedChanges) {
          if(!confirm("You have unsaved changes. Discard them?")) return;
          setHasUnsavedChanges(false);
      }

      if (result.type === 'request') {
          handleSelectRequest(result.data as RequestData);
          return;
      }

      let moduleType = '';
      switch(result.type) {
          case 'estimator': moduleType = 'adhoc-estimator'; break;
          case 'architecture': moduleType = 'adhoc-architecture'; break;
          case 'data-modeler': moduleType = 'data-modeler'; break;
          case 'describer': moduleType = 'project-describer'; break;
          case 'dictionary': moduleType = 'data-dictionary'; break;
          case 'dq': moduleType = 'dq-module'; break;
          case 'solution-doc-pro': moduleType = 'solution-doc-pro'; break;
          case 'casestory': moduleType = 'case-story'; break;
      }

      if (moduleType) {
          const newTabId = `hist-${result.id}`;
          const existing = openTabs.find(t => t.id === newTabId);
          if (existing) {
              setActiveTabId(newTabId);
              return;
          }

          const newTab: WorkspaceTab = {
              id: newTabId,
              type: moduleType,
              label: result.title,
              timestamp: Date.now(),
              data: result.data,
              viewMode: 'hub'
          };

          setOpenTabs(prev => {
              const current = [...prev];
              if (current.length >= 5) current.shift();
              return [...current, newTab];
          });
          setActiveTabId(newTabId);
      }
  };

  const getActiveComponent = () => {
      if (activeTabId === 'dashboard') {
          const dashboardStats = {
              total: requests.length || 12,
              inProgress: requests.filter(r => r.status === 'In Progress').length || 3,
              completed: requests.filter(r => r.status === 'Completed').length || 9
          };
          return (
            <DashboardView 
                stats={dashboardStats}
                requests={requests} 
                onSelectRequest={handleSelectRequest} 
                onDeleteRequest={handleDeleteRequest}
                setActiveTab={(t) => handleSwitchTab(t)}
                handleSwitchTab={handleSwitchTab}
            />
          );
      }

      const activeTab = openTabs.find(t => t.id === activeTabId);
      if (!activeTab) return null;

      switch (activeTab.type) {
          case 'design-module':
              return (
                <DesignHub 
                    requests={requests}
                    onRequestCreate={handleCreateSubmit} 
                    onSelectRequest={handleSelectRequest}
                    onDeleteRequest={handleDeleteRequest}
                    userProfile={userProfile}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    handleSwitchTab={handleSwitchTab}
                    initialView={activeTab.viewMode === 'create' ? 'create' : 'hub'}
                />
              );
          case 'design': 
              return (
                 <SolutionDesignView 
                   request={selectedRequest} 
                   designCache={designCache}
                   onUpdateDesignCache={handleUpdateDesignCache}
                   onUpdateRequestStatus={handleUpdateRequestStatus}
                   onDeleteRequest={handleDeleteRequest}
                   onBack={() => handleSwitchTab('design-module')}
                 />
              );
          case 'project-describer':
              return <ProjectDescriber initialView={activeTab.viewMode === 'create' ? 'create' : (activeTab.data ? 'detail' : 'hub')} initialData={activeTab.data} />;
          case 'adhoc-estimator':
              return <StandaloneEstimator initialView={activeTab.viewMode === 'create' ? 'input' : (activeTab.data?.estimationRows ? 'results' : 'hub')} initialData={activeTab.data} initialContext={activeTab.data?.quickContext} />;
          case 'adhoc-architecture':
              return <StandaloneArchitecture initialData={activeTab.data?.data} initialView={activeTab.viewMode === 'create' ? 'create' : (activeTab.data ? 'workspace' : 'dashboard')} fullHistoryItem={activeTab.data} />;
          case 'data-modeler':
              return <StandaloneDataModeler initialView={activeTab.viewMode === 'create' ? 'setup' : (activeTab.data ? 'workspace' : 'hub')} initialData={activeTab.data} />;
          case 'data-dictionary':
              return <StandaloneDataDictionary initialView={activeTab.viewMode === 'create' ? 'create' : (activeTab.data ? 'browser' : 'management')} initialData={activeTab.data} />;
          case 'dq-module':
              return <StandaloneDataQuality initialView={activeTab.viewMode === 'hub' ? 'hub' : (activeTab.data ? 'workspace' : 'hub')} initialData={activeTab.data} />;
          case 'solution-doc-pro':
              return <StandaloneSolutionDocument initialView={activeTab.viewMode === 'create' ? 'landing' : (activeTab.data ? 'dashboard' : 'requests')} initialData={activeTab.data} />;
          case 'case-story':
              return <StandaloneCaseStory />;
          case 'policy-generator':
              return (
                <CopilotPolicyGenerator 
                  initialIndustry={activeTab.data?.industry} 
                  initialContext={activeTab.data?.context} 
                  clientName={activeTab.data?.clientName} 
                  onNavigateHome={() => setActiveTabId('dashboard')}
                />
              );
          case 'glossary-generator':
              return <CopilotGlossaryGenerator initialIndustry={activeTab.data?.industry} initialDomain={activeTab.data?.domain} initialContext={activeTab.data?.context} clientName={activeTab.data?.clientName} />;
          case 'raci-generator':
              return <CopilotRaciGenerator initialIndustry={activeTab.data?.industry} initialContext={activeTab.data?.context} clientName={activeTab.data?.clientName} />;
          default:
              return null;
      }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  const getHeaderTitle = () => {
    if (activeTabId === 'dashboard') return 'HTC Copilot • Command Center';
    const activeTab = openTabs.find(t => t.id === activeTabId);
    return activeTab ? `${activeTab.label} • HTC Copilot` : 'HTC Copilot';
  };

  return (
    <div className="flex h-screen font-sans text-slate-900 overflow-hidden relative">
      
      {showNavigationAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in p-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-white/50 ring-1 ring-black/5">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                      <div className="p-3 bg-red-100/50 rounded-full"><AlertTriangle size={24} /></div>
                      <h3 className="text-lg font-bold">Unsaved Changes</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                      You have unsaved work in progress. If you navigate away now, your current changes will be lost.
                  </p>
                  <div className="flex gap-3 justify-end">
                      <button onClick={cancelNavigation} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100/50 rounded-xl text-sm transition-colors">Continue Editing</button>
                      <button onClick={confirmNavigation} className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-red-500/20">Discard & Leave</button>
                  </div>
              </div>
          </div>
      )}

      <TaskSidebar 
          activeTabId={activeTabId}
          openTabs={openTabs}
          onActivateTab={handleActivateTab}
          onCreateTab={handleSwitchTab}
          onCloseTab={handleCloseTab}
          onNavigateHome={() => handleActivateTab('dashboard')}
          onLogout={handleLogout}
          userProfile={userProfile}
          onOpenProfile={() => setShowProfile(true)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300">
        <Header 
          title={getHeaderTitle()} 
          toggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenGuide={() => setShowGuide(true)}
          onSearch={handleGlobalSearch}
          searchResults={searchResults}
          onSelectResult={handleSelectSearchResult}
        />
        
        <main className="flex-1 min-h-0 relative p-3 sm:p-4 md:p-6 flex flex-col overflow-hidden">
          <UserGuide 
            isOpen={showGuide} 
            onClose={() => setShowGuide(false)} 
            onLaunchModule={(mod) => {
              handleSwitchTab(mod);
              setShowGuide(false);
            }}
          />
          <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} profile={userProfile} onSave={(p) => setUserProfile(p)} />
          <div className="flex-1 min-h-0 w-full h-full rounded-3xl overflow-hidden flat-panel relative shadow-2xl flex flex-col">
              {getActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
