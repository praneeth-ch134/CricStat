import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, MapPin, Clock, 
  Users, Trophy, ArrowDownUp 
} from 'lucide-react';
import axios from 'axios';
import { SocketContext } from '../../context/SocketContext';
import Scoreboard from '../../components/Scoreboard';

const LiveMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscribeToMatch, unsubscribeFromMatch, connected, matchUpdates } = useContext(SocketContext);
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scorecard');
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  useEffect(() => {
    fetchMatchDetails();
    
    // Subscribe to match updates via socket
    subscribeToMatch(id);
    
    // Set refresh interval for non-socket fallback
    const interval = setInterval(() => {
      if (!connected) {
        fetchMatchDetails();
      }
    }, 30000); // 30 seconds refresh if socket not connected
    
    setRefreshInterval(interval);
    
    // Cleanup function
    return () => {
      unsubscribeFromMatch(id);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [id, connected]);
  
  // Listen for updates from socket
  useEffect(() => {
    if (matchUpdates[id]) {
      // Update match data
      setMatch(prev => ({
        ...prev,
        ...matchUpdates[id]
      }));
    }
  }, [matchUpdates, id]);
  
  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/matches/${id}`);
      setMatch(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching match details:', err);
      setError('Failed to load match details. Please try again later.');
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
  
  // If loading or error
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="inline-block w-8 h-8 border-4 border-cricket-scoreboard border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/matches')}
          className="mt-4 btn-secondary"
        >
          Back to Matches
        </button>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Match not found.</p>
        <button 
          onClick={() => navigate('/matches')}
          className="mt-4 btn-secondary"
        >
          Back to Matches
        </button>
      </div>
    );
  }
  
  // Get current innings data
  const currentInnings = match.currentInnings || (match.innings?.length > 0 ? 1 : 0);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <Link
          to="/matches"
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to All Matches
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{match.title}</h1>
                {match.status === 'live' && (
                  <span className="live-indicator ml-3 px-3 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    LIVE
                  </span>
                )}
                
                {match.status === 'completed' && (
                  <span className="ml-3 px-3 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    COMPLETED
                  </span>
                )}
                
                {match.status === 'upcoming' && (
                  <span className="ml-3 px-3 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    UPCOMING
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap mt-2">
                <div className="flex items-center text-gray-600 text-sm mr-4 mb-2">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(match.date)}</span>
                </div>
                
                {match.venue && (
                  <div className="flex items-center text-gray-600 text-sm mr-4 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{match.venue}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <Clock size={14} className="mr-1" />
                  <span>{match.overs} overs</span>
                </div>
              </div>
            </div>
            
            {connected && (
              <div className="mt-3 md:mt-0 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Live updates active
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className="font-bold text-lg md:text-xl text-gray-800">{match.teams[0].name}</div>
              </div>
              
              <div className="px-4 text-gray-400 font-bold">vs</div>
              
              <div className="text-center flex-1">
                <div className="font-bold text-lg md:text-xl text-gray-800">{match.teams[1].name}</div>
              </div>
            </div>
            
            {match.toss && (
              <div className="mt-4 text-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <Trophy size={14} className="inline-block mr-1" />
                <span>
                  {match.toss.winner} won the toss and elected to {match.toss.decision} first
                </span>
              </div>
            )}
            
            {match.status === 'completed' && match.result && (
              <div className="mt-4 text-center font-medium bg-cricket-scoreboard/10 p-3 rounded">
                {match.result}
              </div>
            )}
          </div>
        </div>
        
        {/* Match navigation */}
        {match.status !== 'upcoming' && (
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center text-sm font-medium ${
                activeTab === 'scorecard' 
                  ? 'text-cricket-scoreboard border-b-2 border-cricket-scoreboard' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('scorecard')}
            >
              Scorecard
            </button>
            
            <button
              className={`flex-1 py-3 text-center text-sm font-medium ${
                activeTab === 'players' 
                  ? 'text-cricket-scoreboard border-b-2 border-cricket-scoreboard' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('players')}
            >
              Players
            </button>
          </div>
        )}
        
        {/* Match content */}
        <div className="p-4 md:p-6">
          {match.status === 'upcoming' ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="inline-block p-4 bg-blue-50 rounded-full">
                  <Clock size={40} className="text-blue-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Match Not Started Yet</h2>
              <p className="text-gray-600">
                This match is scheduled to start at {formatDate(match.date)}
              </p>
            </div>
          ) : activeTab === 'scorecard' ? (
            <div>
              {match.innings && match.innings.length > 0 ? (
                <div className="space-y-6">
                  {/* Current Scoreboard */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center">
                      <ArrowDownUp size={16} className="mr-2" />
                      Current Innings
                    </h2>
                    <Scoreboard 
                      match={match} 
                      innings={match.innings} 
                      currentInnings={currentInnings} 
                    />
                  </div>
                  
                  {/* Batting Scorecard */}
                  <div className="overflow-x-auto">
                    <h2 className="text-lg font-semibold mb-3">
                      Batting - {match.innings[currentInnings - 1]?.battingTeam}
                    </h2>
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 border-b font-medium text-gray-700">Batsman</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">R</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">B</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">4s</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">6s</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {match.innings[currentInnings - 1]?.batsmen?.map((batsman, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 flex items-center">
                              <div className="font-medium text-gray-800">{batsman.name}</div>
                              {batsman.status === 'batting' && (
                                <span className="ml-2 text-green-600 text-xs font-medium">
                                  {batsman.onStrike ? '* (on strike)' : '(non-striker)'}
                                </span>
                              )}
                              {batsman.status === 'out' && (
                                <span className="ml-2 text-red-600 text-xs font-medium">out</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center font-medium">{batsman.runs}</td>
                            <td className="py-2 px-3 text-center">{batsman.balls}</td>
                            <td className="py-2 px-3 text-center">{batsman.fours}</td>
                            <td className="py-2 px-3 text-center">{batsman.sixes}</td>
                            <td className="py-2 px-3 text-center">
                              {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Extras row */}
                        <tr className="border-b bg-gray-50">
                          <td className="py-2 px-3 font-medium">Extras</td>
                          <td className="py-2 px-3 text-center font-medium">
                            {match.innings[currentInnings - 1]?.extras?.total || 0}
                          </td>
                          <td className="py-2 px-3 text-center" colSpan={4}>
                            <span className="text-sm text-gray-600">
                              (Wd: {match.innings[currentInnings - 1]?.extras?.wides || 0}, 
                              NB: {match.innings[currentInnings - 1]?.extras?.noBalls || 0}, 
                              B: {match.innings[currentInnings - 1]?.extras?.byes || 0}, 
                              LB: {match.innings[currentInnings - 1]?.extras?.legByes || 0})
                            </span>
                          </td>
                        </tr>
                        
                        {/* Total row */}
                        <tr className="font-bold bg-gray-100">
                          <td className="py-2 px-3">TOTAL</td>
                          <td className="py-2 px-3 text-center">
                            {match.innings[currentInnings - 1]?.runs || 0}
                          </td>
                          <td className="py-2 px-3 text-center" colSpan={4}>
                            ({Math.floor((match.innings[currentInnings - 1]?.balls || 0) / 6)}.
                            {(match.innings[currentInnings - 1]?.balls || 0) % 6} Overs, 
                            RR: {((match.innings[currentInnings - 1]?.runs || 0) / 
                                  (match.innings[currentInnings - 1]?.balls || 1) * 6).toFixed(2)})
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Bowling Scorecard */}
                  <div className="overflow-x-auto">
                    <h2 className="text-lg font-semibold mb-3">
                      Bowling - {match.innings[currentInnings - 1]?.bowlingTeam}
                    </h2>
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 border-b font-medium text-gray-700">Bowler</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">O</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">M</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">R</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">W</th>
                          <th className="py-2 px-3 border-b font-medium text-gray-700 text-center">Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {match.innings[currentInnings - 1]?.bowlers?.map((bowler, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium text-gray-800">
                              {bowler.name}
                              {bowler.status === 'bowling' && (
                                <span className="ml-2 text-blue-600 text-xs font-medium">bowling</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {bowler.overs}.{bowler.balls}
                            </td>
                            <td className="py-2 px-3 text-center">{bowler.maidens}</td>
                            <td className="py-2 px-3 text-center">{bowler.runs}</td>
                            <td className="py-2 px-3 text-center font-medium">{bowler.wickets}</td>
                            <td className="py-2 px-3 text-center">{bowler.economy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* First Innings Summary (if in second innings) */}
                  {currentInnings === 2 && match.innings.length > 1 && (
                    <div className="mt-8 pt-4 border-t">
                      <h2 className="text-lg font-semibold mb-3">First Innings Summary</h2>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{match.innings[0].battingTeam}</div>
                            <div className="text-xl font-bold">
                              {match.innings[0].runs}/{match.innings[0].wickets}
                            </div>
                            <div className="text-sm text-gray-600">
                              ({Math.floor(match.innings[0].balls / 6)}.{match.innings[0].balls % 6} ov)
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Run Rate</div>
                            <div className="font-bold">
                              {(match.innings[0].runs / match.innings[0].balls * 6).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Top 2 batsmen */}
                        <div className="mt-4">
                          <div className="text-sm text-gray-600 mb-1">Top Performers</div>
                          <div className="space-y-1">
                            {match.innings[0].batsmen
                              .sort((a, b) => b.runs - a.runs)
                              .slice(0, 2)
                              .map((batsman, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{batsman.name}</span>
                                  <span className="ml-1">
                                    {batsman.runs} ({batsman.balls})
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No scorecard data available yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {match.teams.map((team, teamIdx) => (
                  <div key={teamIdx} className="bg-gray-50 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold mb-3">{team.name}</h3>
                    <div className="space-y-1">
                      {team.players.map((player, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center bg-white rounded p-2 border"
                        >
                          <Users size={16} className="text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium">{player.name}</span>
                            {player.isCaptain && (
                              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">C</span>
                            )}
                            {player.isWicketkeeper && (
                              <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">WK</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMatch;