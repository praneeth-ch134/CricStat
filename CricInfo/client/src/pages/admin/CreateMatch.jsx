import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ChevronLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const CreateMatch = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Step 1: Basic Match Details
  const [matchDetails, setMatchDetails] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    venue: '',
    overs: 20
  });
  
  // Step 2: Team Details
  const [teams, setTeams] = useState([
    { 
      name: '', 
      players: Array(11).fill('').map(() => ({ name: '', isCaptain: false, isWicketkeeper: false }))
    },
    { 
      name: '', 
      players: Array(11).fill('').map(() => ({ name: '', isCaptain: false, isWicketkeeper: false }))
    }
  ]);

  // Step 3: Toss Details
  const [tossDetails, setTossDetails] = useState({
    winner: '',
    decision: 'bat'
  });

  const handleMatchDetailsChange = (e) => {
    const { name, value } = e.target;
    setMatchDetails({ ...matchDetails, [name]: value });
  };

  const handleTeamNameChange = (index, value) => {
    const updatedTeams = [...teams];
    updatedTeams[index].name = value;
    setTeams(updatedTeams);
    
    // Also update toss winner options if needed
    if (tossDetails.winner === '' && value) {
      setTossDetails({ ...tossDetails, winner: value });
    }
  };

  const handlePlayerChange = (teamIndex, playerIndex, field, value) => {
    const updatedTeams = [...teams];
    
    if (field === 'isCaptain' || field === 'isWicketkeeper') {
      // If setting this player as captain/wicketkeeper, unset for all other players in this team
      if (value) {
        updatedTeams[teamIndex].players.forEach((player, idx) => {
          if (idx !== playerIndex) {
            player[field] = false;
          }
        });
      }
      updatedTeams[teamIndex].players[playerIndex][field] = value;
    } else {
      updatedTeams[teamIndex].players[playerIndex][field] = value;
    }
    
    setTeams(updatedTeams);
  };

  const handleTossChange = (e) => {
    const { name, value } = e.target;
    setTossDetails({ ...tossDetails, [name]: value });
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!matchDetails.title.trim()) {
        setError('Match title is required');
        return false;
      }
      if (!matchDetails.date) {
        setError('Match date and time is required');
        return false;
      }
      setError(null);
      return true;
    }
    
    if (currentStep === 2) {
      if (!teams[0].name.trim() || !teams[1].name.trim()) {
        setError('Both team names are required');
        return false;
      }
      
      // Check if at least one player is entered for each team
      const team1HasPlayers = teams[0].players.some(p => p.name.trim());
      const team2HasPlayers = teams[1].players.some(p => p.name.trim());
      
      if (!team1HasPlayers || !team2HasPlayers) {
        setError('Each team needs at least one player');
        return false;
      }
      
      // Check if captains are selected
      const team1HasCaptain = teams[0].players.some(p => p.isCaptain);
      const team2HasCaptain = teams[1].players.some(p => p.isCaptain);
      
      if (!team1HasCaptain || !team2HasCaptain) {
        setError('Each team needs a captain');
        return false;
      }
      
      setError(null);
      return true;
    }
    
    return true;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    // Filter out empty player names
    const filteredTeams = teams.map(team => ({
      ...team,
      players: team.players.filter(player => player.name.trim() !== '')
    }));
    
    // Prepare match data
    const matchData = {
      ...matchDetails,
      teams: filteredTeams,
      toss: tossDetails,
      status: 'upcoming',
      createdBy: user?.id || 'admin'
    };
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.post('/api/admin/matches', matchData);
      
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error creating match:', err);
      setError(err.response?.data?.message || 'Failed to create match. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create New Match</h1>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className="text-sm font-medium text-gray-700">Match Details</div>
          <div className="text-sm font-medium text-gray-700">Team Information</div>
          <div className="text-sm font-medium text-gray-700">Toss & Confirmation</div>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-cricket-scoreboard h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card">
        {/* Step 1: Match Details */}
        {currentStep === 1 && (
          <div className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Match Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="label">Match Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="input"
                  placeholder="e.g. College Championship Final"
                  value={matchDetails.title}
                  onChange={handleMatchDetailsChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="date" className="label">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Date & Time
                  </div>
                </label>
                <input
                  id="date"
                  name="date"
                  type="datetime-local"
                  className="input"
                  value={matchDetails.date}
                  onChange={handleMatchDetailsChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="venue" className="label">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    Venue
                  </div>
                </label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  className="input"
                  placeholder="e.g. University Cricket Ground"
                  value={matchDetails.venue}
                  onChange={handleMatchDetailsChange}
                />
              </div>
              
              <div>
                <label htmlFor="overs" className="label">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    Total Overs
                  </div>
                </label>
                <select
                  id="overs"
                  name="overs"
                  className="input"
                  value={matchDetails.overs}
                  onChange={handleMatchDetailsChange}
                  required
                >
                  <option value="5">5 Overs</option>
                  <option value="10">10 Overs</option>
                  <option value="20">20 Overs</option>
                  <option value="50">50 Overs</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Team Details */}
        {currentStep === 2 && (
          <div className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Team Information</h2>
            
            <div className="space-y-8">
              {teams.map((team, teamIndex) => (
                <div key={teamIndex} className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-4">
                    <label htmlFor={`team-${teamIndex}`} className="label">
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        Team {teamIndex + 1} Name
                      </div>
                    </label>
                    <input
                      id={`team-${teamIndex}`}
                      type="text"
                      className="input"
                      placeholder="e.g. Engineering College"
                      value={team.name}
                      onChange={(e) => handleTeamNameChange(teamIndex, e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Players (add at least one)</label>
                    </div>
                    
                    <div className="space-y-2">
                      {team.players.map((player, playerIndex) => (
                        <div key={playerIndex} className="flex items-center space-x-2">
                          <div className="w-6 text-center text-xs text-gray-500">{playerIndex + 1}</div>
                          <input
                            type="text"
                            className="input flex-grow"
                            placeholder={`Player ${playerIndex + 1} name`}
                            value={player.name}
                            onChange={(e) => handlePlayerChange(teamIndex, playerIndex, 'name', e.target.value)}
                          />
                          <div className="flex items-center space-x-1">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={player.isCaptain}
                                onChange={(e) => handlePlayerChange(teamIndex, playerIndex, 'isCaptain', e.target.checked)}
                              />
                              <div className="relative w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ms-1 text-xs font-medium text-gray-500">C</span>
                            </label>
                            
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={player.isWicketkeeper}
                                onChange={(e) => handlePlayerChange(teamIndex, playerIndex, 'isWicketkeeper', e.target.checked)}
                              />
                              <div className="relative w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ms-1 text-xs font-medium text-gray-500">WK</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 3: Toss Details and Confirmation */}
        {currentStep === 3 && (
          <div className="p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Toss Details & Confirmation</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label htmlFor="winner" className="label">Toss Winner</label>
                <select
                  id="winner"
                  name="winner"
                  className="input"
                  value={tossDetails.winner}
                  onChange={handleTossChange}
                  required
                >
                  <option value="">Select team</option>
                  {teams[0].name && <option value={teams[0].name}>{teams[0].name}</option>}
                  {teams[1].name && <option value={teams[1].name}>{teams[1].name}</option>}
                </select>
              </div>
              
              <div>
                <label htmlFor="decision" className="label">Decision</label>
                <select
                  id="decision"
                  name="decision"
                  className="input"
                  value={tossDetails.decision}
                  onChange={handleTossChange}
                  required
                >
                  <option value="bat">Bat</option>
                  <option value="bowl">Bowl</option>
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Match Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Match:</span>
                  <span className="col-span-2 font-medium">{matchDetails.title}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="col-span-2 font-medium">
                    {new Date(matchDetails.date).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Venue:</span>
                  <span className="col-span-2 font-medium">{matchDetails.venue || 'Not specified'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Overs:</span>
                  <span className="col-span-2 font-medium">{matchDetails.overs} overs per side</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Teams:</span>
                  <span className="col-span-2 font-medium">
                    {teams[0].name} vs {teams[1].name}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-gray-600">Toss:</span>
                  <span className="col-span-2 font-medium">
                    {tossDetails.winner
                      ? `${tossDetails.winner} won the toss and elected to ${tossDetails.decision} first`
                      : 'Not decided yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between border-t">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="btn-secondary"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="btn-primary"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Creating...
                </>
              ) : (
                'Create Match'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateMatch;