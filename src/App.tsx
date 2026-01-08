import React from 'react';
import AuthGate from './components/AuthGate';
import MapView from './components/MapView';
import Feed from './components/Feed';

/**
 * Root component for the rock-fun application.
 *
 * This component wraps the core layout in an authentication gate. Once
 * the user has authenticated via Supabase, the map and recent finds
 * feed are displayed side ‑ side on larger screens or stacked on
 * smaller devices. Feel free to customize the layout further but keep
 * the component as lean as possible to maintain a clear separation of
 * concerns. Styling is handled via Tailwind classes defined in
 * `index.css`.
 */
function App() {
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header placeholder for future navigation or branding */}
        <header className="p-4 shadow-sm bg-white sticky top-0 z-10">
          <h1 className="text-xl font-semibold">Rock - Fun</h1>
        </header>
        {/* Main content area */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/2 h-64 md:h-auto">
            <MapView />
          </div>
          <div className="md:w-1/2 overflow-y-auto">
            <Feed />
          </div>
        </main>
      </div>
    </AuthGate>
  );
}

export default App;
