import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Calendar, CheckCircle2, Activity } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/matches');
      setMatches(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Group matches by status
  const liveMatches = matches.filter(match => match.status === 'live');
  const upcomingMatches = matches.filter(match => match.status === 'upcoming');
  const completedMatches = matches.filter(match => match.status === 'completed');

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage cricket matches and live scoring</p>
        </div>
        
        <Link
          to="/admin/create-match"
          className="btn-primary mt-4 md:mt-0 flex items-center justify-center md:justify-start"
        >
          <PlusCircle size={18} className="mr-2" />
          Create New Match
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="inline-block w-6 h-6 border-4 border-cricket-scoreboard border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Matches */}
          <div>
            <div className="flex items-center mb-4">
              <Activity size={20} className="text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Live Matches</h2>
            </div>
            
            {liveMatches.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                No live matches at the moment
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((match) => (
                  <div key={match._id} className="card hover:shadow-md transition-shadow">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{match.title}</h3>
                        <span className="live-indicator px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          LIVE
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {match.teams[0].name} vs {match.teams[1].name}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={14} className="mr-1" />
                        <span>
                          {match.venue || 'No venue specified'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t p-3 bg-gray-50 flex space-x-2">
                      <Link
                        to={`/admin/scoring/${match._id}`}
                        className="btn-primary flex-1 py-1.5 text-sm flex items-center justify-center"
                      >
                        Continue Scoring
                      </Link>
                      
                      <Link
                        to={`/match/${match._id}`}
                        className="btn-secondary flex-1 py-1.5 text-sm flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Public
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Upcoming Matches */}
          <div>
            <div className="flex items-center mb-4">
              <Clock size={20} className="text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Upcoming Matches</h2>
            </div>
            
            {upcomingMatches.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                No upcoming matches scheduled
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMatches.map((match) => (
                  <div key={match._id} className="card hover:shadow-md transition-shadow">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{match.title}</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          UPCOMING
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {match.teams[0].name} vs {match.teams[1].name}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={14} className="mr-1" />
                        <span>
                          {match.venue || 'No venue specified'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t p-3 bg-gray-50">
                      <Link
                        to={`/admin/scoring/${match._id}`}
                        className="btn-primary w-full py-1.5 text-sm flex items-center justify-center"
                      >
                        Start Scoring
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Completed Matches */}
          <div>
            <div className="flex items-center mb-4">
              <CheckCircle2 size={20} className="text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Completed Matches</h2>
            </div>
            
            {completedMatches.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                No completed matches yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMatches.map((match) => (
                  <div key={match._id} className="card hover:shadow-md transition-shadow">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{match.title}</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          COMPLETED
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {match.teams[0].name} vs {match.teams[1].name}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t p-3 bg-gray-50">
                      <Link
                        to={`/match/${match._id}`}
                        className="btn-secondary w-full py-1.5 text-sm flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Scorecard
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;