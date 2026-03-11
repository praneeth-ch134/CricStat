import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import MatchCard from '../../components/MatchCard';
import { SocketContext } from '../../context/SocketContext';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const { connected, matchUpdates } = useContext(SocketContext);
  
  useEffect(() => {
    fetchMatches();
  }, []);
  
  // Listen for match updates from socket
  useEffect(() => {
    if (Object.keys(matchUpdates).length > 0) {
      // Update match data when socket event is received
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (matchUpdates[match._id]) {
            return { ...match, ...matchUpdates[match._id] };
          }
          return match;
        });
      });
    }
  }, [matchUpdates]);
  
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/matches');
      setMatches(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchMatches();
  };
  
  // Filter matches based on status
  const filteredMatches = activeFilter === 'all' 
    ? matches 
    : matches.filter(match => match.status === activeFilter);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cricket Matches</h1>
          <p className="text-gray-600 mt-1">Live scores and match details</p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 btn-secondary flex items-center justify-center"
          disabled={loading}
        >
          <RefreshCw 
            size={18} 
            className={`mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Match filters */}
      <div className="flex overflow-x-auto scrollbar-hide mb-6 bg-white rounded-lg border p-1 shadow-sm">
        <button
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'all' 
              ? 'bg-cricket-scoreboard text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          All Matches
        </button>
        <button
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'live' 
              ? 'bg-cricket-scoreboard text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveFilter('live')}
        >
          Live
        </button>
        <button
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'upcoming' 
              ? 'bg-cricket-scoreboard text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'completed' 
              ? 'bg-cricket-scoreboard text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-cricket-scoreboard border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(match => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border">
          <h3 className="text-lg font-medium text-gray-600">No matches found</h3>
          <p className="text-gray-500 mt-2">
            {activeFilter === 'all' 
              ? 'There are no cricket matches in the system.' 
              : `There are no ${activeFilter} matches right now.`}
          </p>
        </div>
      )}
      
      {connected && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200 shadow-sm">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
          Live updates active
        </div>
      )}
    </div>
  );
};

export default Matches;