import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, User, Users, AlertTriangle, CheckCircle2, 
  PlusCircle, MinusCircle, Hash, BadgePlus, Clock, Info 
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import Scoreboard from '../../components/Scoreboard';

const ScoringPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { sendBallUpdate } = useContext(SocketContext);
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchStarted, setMatchStarted] = useState(false);
  
  const [currentInnings, setCurrentInnings] = useState(1);
  const [inningsData, setInningsData] = useState([]);
  
  const [currentBall, setCurrentBall] = useState({
    runs: 0,
    isExtra: false,
    extraType: '',
    extraRuns: 0,
    isWicket: false,
    wicketType: '',
    batsman: '',
    bowler: '',
    commentary: ''
  });
  
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndInningsModal, setShowEndInningsModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);
  const [newBowler, setNewBowler] = useState('');
  const [newBatsman, setNewBatsman] = useState('');
  
  const [inningsSetup, setInningsSetup] = useState({
    battingTeam: '',
    bowlingTeam: '',
    batsman1: '',
    batsman2: '',
    bowler: ''
  });

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/matches/${id}`);
      setMatch(response.data);
      
      if (response.data.innings && response.data.innings.length > 0) {
        setInningsData(response.data.innings);
        setCurrentInnings(response.data.currentInnings || 1);
        setMatchStarted(true);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching match details:', err);
      setError('Failed to load match details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInnings = async () => {
    if (!inningsSetup.battingTeam || !inningsSetup.bowlingTeam || 
        !inningsSetup.batsman1 || !inningsSetup.batsman2 || !inningsSetup.bowler) {
      setError('Please select all required fields to start the innings');
      return;
    }
    
    try {
      const newInningsData = {
        battingTeam: inningsSetup.battingTeam,
        bowlingTeam: inningsSetup.bowlingTeam,
        batsmen: [
          {
            name: inningsSetup.batsman1,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            status: 'batting',
            onStrike: true
          },
          {
            name: inningsSetup.batsman2,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            status: 'batting',
            onStrike: false
          }
        ],
        bowlers: [
          {
            name: inningsSetup.bowler,
            overs: 0,
            balls: 0,
            maidens: 0,
            runs: 0,
            wickets: 0,
            economy: 0,
            status: 'bowling'
          }
        ],
        runs: 0,
        wickets: 0,
        balls: 0,
        extras: {
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
          total: 0
        },
        recentBalls: []
      };
      
      let updateData = {
        innings: [...inningsData, newInningsData],
        currentInnings: currentInnings,
        status: 'live'
      };
      
      const response = await axios.put(`/api/admin/matches/${id}`, updateData);
      
      setMatch({
        ...match,
        ...updateData,
        innings: [...inningsData, newInningsData]
      });
      
      setInningsData([...inningsData, newInningsData]);
      setMatchStarted(true);
      setShowStartModal(false);
      
      sendBallUpdate(id, {
        type: 'innings_start',
        innings: [...inningsData, newInningsData],
        currentInnings: currentInnings
      });
      
    } catch (err) {
      console.error('Error starting innings:', err);
      setError('Failed to start innings. Please try again.');
    }
  };

  const handleEndInnings = async () => {
    try {
      if (currentInnings === 1) {
        setCurrentInnings(2);
        
        const firstInnings = inningsData[0];
        setInningsSetup({
          battingTeam: firstInnings.bowlingTeam,
          bowlingTeam: firstInnings.battingTeam,
          batsman1: '',
          batsman2: '',
          bowler: ''
        });
        
        setShowEndInningsModal(false);
        setShowStartModal(true);
        
        const updateData = {
          currentInnings: 2
        };
        
        await axios.put(`/api/admin/matches/${id}`, updateData);
        
        sendBallUpdate(id, {
          type: 'innings_end',
          currentInnings: 1
        });
      } else {
        const updateData = {
          status: 'completed'
        };
        
        await axios.put(`/api/admin/matches/${id}`, updateData);
        
        sendBallUpdate(id, {
          type: 'match_end'
        });
        
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Error ending innings:', err);
      setError('Failed to end innings. Please try again.');
    }
  };

  const handleBowlerChange = async () => {
    try {
      const currentInningData = { ...inningsData[currentInnings - 1] };
      
      const currentBowlerIndex = currentInningData.bowlers.findIndex(b => b.status === 'bowling');
      if (currentBowlerIndex !== -1) {
        currentInningData.bowlers[currentBowlerIndex].status = 'bowled';
      }
      
      let newBowlerIndex = currentInningData.bowlers.findIndex(b => b.name === newBowler);
      if (newBowlerIndex === -1) {
        currentInningData.bowlers.push({
          name: newBowler,
          overs: 0,
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          economy: 0,
          status: 'bowling'
        });
      } else {
        currentInningData.bowlers[newBowlerIndex].status = 'bowling';
      }
      
      const updatedInningsData = [...inningsData];
      updatedInningsData[currentInnings - 1] = currentInningData;
      
      await axios.put(`/api/admin/matches/${id}`, {
        innings: updatedInningsData
      });
      
      setInningsData(updatedInningsData);
      setShowBowlerModal(false);
      setNewBowler('');
      
    } catch (err) {
      console.error('Error changing bowler:', err);
      setError('Failed to change bowler. Please try again.');
    }
  };

  const handleNewBatsman = async () => {
    try {
      const currentInningData = { ...inningsData[currentInnings - 1] };
      
      currentInningData.batsmen.push({
        name: newBatsman,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        status: 'batting',
        onStrike: true
      });
      
      const updatedInningsData = [...inningsData];
      updatedInningsData[currentInnings - 1] = currentInningData;
      
      await axios.put(`/api/admin/matches/${id}`, {
        innings: updatedInningsData
      });
      
      setInningsData(updatedInningsData);
      setShowNewBatsmanModal(false);
      setNewBatsman('');
      
    } catch (err) {
      console.error('Error adding new batsman:', err);
      setError('Failed to add new batsman. Please try again.');
    }
  };

  const handleBallUpdate = async (ballData) => {
    try {
      const currentInningData = { ...inningsData[currentInnings - 1] };
      let runsFromBall = ballData.runs;
      
      if (ballData.isExtra) {
        const extraRuns = ballData.extraRuns || 1;
        runsFromBall += extraRuns;
        
        switch (ballData.extraType) {
          case 'wide':
            currentInningData.extras.wides += extraRuns;
            break;
          case 'no-ball':
            currentInningData.extras.noBalls += extraRuns;
            break;
          case 'bye':
            currentInningData.extras.byes += ballData.runs;
            runsFromBall = extraRuns;
            break;
          case 'leg-bye':
            currentInningData.extras.legByes += ballData.runs;
            runsFromBall = extraRuns;
            break;
        }
        
        currentInningData.extras.total += runsFromBall;
        
        if (ballData.extraType !== 'wide' && ballData.extraType !== 'no-ball') {
          currentInningData.balls += 1;
        }
      } else {
        currentInningData.balls += 1;
      }
      
      currentInningData.runs += runsFromBall;
      
      const strikerIndex = currentInningData.batsmen.findIndex(b => b.onStrike && b.status === 'batting');
      
      if (strikerIndex !== -1) {
        if (!ballData.isExtra || (ballData.isExtra && ballData.extraType !== 'wide')) {
          currentInningData.batsmen[strikerIndex].balls += 1;
        }
        
        if (!ballData.isExtra || (ballData.isExtra && ballData.extraType !== 'bye' && ballData.extraType !== 'leg-bye')) {
          currentInningData.batsmen[strikerIndex].runs += ballData.runs;
          
          if (ballData.runs === 4) {
            currentInningData.batsmen[strikerIndex].fours += 1;
          } else if (ballData.runs === 6) {
            currentInningData.batsmen[strikerIndex].sixes += 1;
          }
        }
      }
      
      const bowlerIndex = currentInningData.bowlers.findIndex(b => b.status === 'bowling');
      
      if (bowlerIndex !== -1) {
        if (!ballData.isExtra || (ballData.isExtra && ballData.extraType !== 'wide' && ballData.extraType !== 'no-ball')) {
          currentInningData.bowlers[bowlerIndex].balls += 1;
          
          if (currentInningData.bowlers[bowlerIndex].balls === 6) {
            currentInningData.bowlers[bowlerIndex].overs += 1;
            currentInningData.bowlers[bowlerIndex].balls = 0;
          }
        }
        
        if (!ballData.isExtra || (ballData.isExtra && ballData.extraType !== 'bye' && ballData.extraType !== 'leg-bye')) {
          currentInningData.bowlers[bowlerIndex].runs += runsFromBall;
        }
        
        const totalBalls = currentInningData.bowlers[bowlerIndex].overs * 6 + currentInningData.bowlers[bowlerIndex].balls;
        if (totalBalls > 0) {
          currentInningData.bowlers[bowlerIndex].economy = (currentInningData.bowlers[bowlerIndex].runs / totalBalls * 6).toFixed(2);
        }
      }
      
      if (ballData.isWicket) {
        currentInningData.wickets += 1;
        
        if (strikerIndex !== -1) {
          currentInningData.batsmen[strikerIndex].status = 'out';
        }
        
        if (bowlerIndex !== -1 && ballData.wicketType !== 'run-out') {
          currentInningData.bowlers[bowlerIndex].wickets += 1;
        }
      }
      
      const ballInfo = {
        runs: ballData.runs,
        isExtra: ballData.isExtra,
        extraType: ballData.extraType,
        wicket: ballData.isWicket,
        wicketType: ballData.wicketType,
        batsmanName: strikerIndex !== -1 ? currentInningData.batsmen[strikerIndex].name : '',
        bowlerName: bowlerIndex !== -1 ? currentInningData.bowlers[bowlerIndex].name : '',
      };
      
      currentInningData.recentBalls = [...currentInningData.recentBalls, ballInfo];
      
      if (!ballData.isWicket) {
        if (ballData.runs % 2 === 1 || 
            (ballData.isExtra && (ballData.extraType === 'bye' || ballData.extraType === 'leg-bye') && ballData.runs % 2 === 1)) {
          const striker = currentInningData.batsmen.findIndex(b => b.status === 'batting' && b.onStrike);
          const nonStriker = currentInningData.batsmen.findIndex(b => b.status === 'batting' && !b.onStrike);
          
          if (striker !== -1 && nonStriker !== -1) {
            currentInningData.batsmen[striker].onStrike = false;
            currentInningData.batsmen[nonStriker].onStrike = true;
          }
        }
        
        const isEndOfOver = !ballData.isExtra && 
                           (ballData.extraType !== 'wide' && ballData.extraType !== 'no-ball') && 
                           currentInningData.balls % 6 === 0;
                           
        if (isEndOfOver) {
          const striker = currentInningData.batsmen.findIndex(b => b.status === 'batting' && b.onStrike);
          const nonStriker = currentInningData.batsmen.findIndex(b => b.status === 'batting' && !b.onStrike);
          
          if (striker !== -1 && nonStriker !== -1) {
            currentInningData.batsmen[striker].onStrike = false;
            currentInningData.batsmen[nonStriker].onStrike = true;
          }
        }
      }
      
      const updatedInningsData = [...inningsData];
      updatedInningsData[currentInnings - 1] = currentInningData;
      
      const updateData = {
        innings: updatedInningsData
      };
      
      await axios.put(`/api/admin/matches/${id}`, updateData);
      setInningsData(updatedInningsData);
      
      sendBallUpdate(id, {
        type: 'ball',
        innings: updatedInningsData,
        currentInnings: currentInnings,
        ballInfo: ballInfo
      });
      
      setCurrentBall({
        runs: 0,
        isExtra: false,
        extraType: '',
        extraRuns: 0,
        isWicket: false,
        wicketType: '',
        batsman: '',
        bowler: '',
        commentary: ''
      });
      
      const isEndOfOver = !ballData.isExtra && 
                         (ballData.extraType !== 'wide' && ballData.extraType !== 'no-ball') && 
                         (currentInningData.balls ) % 6 === 0;
      
      if (isEndOfOver) {
        setShowBowlerModal(true);
      }
      
      if (ballData.isWicket) {
        setShowNewBatsmanModal(true);
      }
      
    } catch (err) {
      console.error('Error updating ball:', err);
      setError('Failed to update ball. Please try again.');
    }
  };

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
          onClick={() => navigate('/admin/dashboard')}
          className="mt-4 btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Match not found.</p>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="mt-4 btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  const currentInningData = inningsData[currentInnings - 1];
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{match.title}</h1>
            <p className="text-gray-600">{match.teams[0].name} vs {match.teams[1].name}</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link
            to={`/match/${id}`}
            className="btn-secondary flex items-center justify-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Users size={18} className="mr-2" />
            View Public Score
          </Link>
        </div>
      </div>
      
      {!matchStarted ? (
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-50 rounded-full">
              <Info size={48} className="text-blue-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Match Not Started Yet</h2>
          <p className="text-gray-600 mb-6">Click the button below to start the match and begin scoring</p>
          <button
            className="btn-primary"
            onClick={() => setShowStartModal(true)}
          >
            Start Match
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="card">
              <div className="p-4 border-b bg-cricket-scoreboard text-white">
                <h2 className="font-semibold">Scoring Panel</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <div className="text-sm font-medium mb-2">Runs</div>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(run => (
                      <button
                        key={run}
                        className={`h-12 font-bold rounded-md ${
                          run === 0 
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                            : run === 4
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : run === 6
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        onClick={() => handleBallUpdate({ runs: run })}
                      >
                        {run}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    className="btn-secondary flex items-center justify-center py-3"
                    onClick={() => setShowExtrasModal(true)}
                  >
                    <BadgePlus size={18} className="mr-2" />
                    Extras
                  </button>
                  
                  <button
                    className="bg-cricket-wicket text-white hover:bg-red-700 rounded-md font-medium transition-all duration-200 flex items-center justify-center py-3"
                    onClick={() => setShowWicketModal(true)}
                  >
                    <AlertTriangle size={18} className="mr-2" />
                    Wicket
                  </button>
                </div>
                
                <button
                  className="btn-primary w-full py-3 mb-4"
                  onClick={() => setShowEndInningsModal(true)}
                >
                  {currentInnings === 1 ? 'End 1st Innings' : 'End Match'}
                </button>
                
                {currentInningData && (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">Current Batsmen</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentInningData.batsmen
                          .filter(b => b.status === 'batting')
                          .map((batsman, idx) => (
                            <div key={idx} className="flex items-center">
                              <div className={`p-1.5 rounded ${batsman.onStrike ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                                <User size={16} className={`${batsman.onStrike ? 'text-yellow-600' : 'text-gray-600'}`} />
                              </div>
                              <div className="ml-2">
                                <div className="font-medium">
                                  {batsman.name}
                                  {batsman.onStrike && <span className="text-yellow-500 ml-1">*</span>}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {batsman.runs} runs ({batsman.balls} balls)
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Current Bowler</div>
                      {currentInningData.bowlers
                        .filter(b => b.status === 'bowling')
                        .map((bowler, idx) => (
                          <div key={idx} className="flex items-center">
                            <div className="p-1.5 rounded bg-blue-100">
                              <User size={16} className="text-blue-600" />
                            </div>
                            <div className="ml-2">
                              <div className="font-medium">{bowler.name}</div>
                              <div className="text-sm text-gray-600">
                                {bowler.wickets}/{bowler.runs} ({bowler.overs}.{bowler.balls} overs)
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="sticky top-4">
              <Scoreboard 
                match={match} 
                innings={inningsData} 
                currentInnings={currentInnings} 
              />
            </div>
          </div>
        </div>
      )}
      
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Start Innings {currentInnings}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Batting Team</label>
                  <select
                    className="input"
                    value={inningsSetup.battingTeam}
                    onChange={(e) => setInningsSetup({
                      ...inningsSetup,
                      battingTeam: e.target.value,
                      bowlingTeam: e.target.value === match.teams[0].name ? match.teams[1].name : match.teams[0].name
                    })}
                    required
                  >
                    <option value="">Select batting team</option>
                    <option value={match.teams[0].name}>{match.teams[0].name}</option>
                    <option value={match.teams[1].name}>{match.teams[1].name}</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Bowler</label>
                  <select
                    className="input"
                    value={inningsSetup.bowler}
                    onChange={(e) => setInningsSetup({...inningsSetup, bowler: e.target.value})}
                    required
                  >
                    <option value="">Select bowler</option>
                    {match.teams.find(t => t.name === inningsSetup.bowlingTeam)?.players.map((player, idx) => (
                      <option key={idx} value={player.name}>
                        {player.name}
                        {player.isCaptain ? ' (C)' : ''}
                        {player.isWicketkeeper ? ' (WK)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Batsman 1 (Striker)</label>
                    <select
                      className="input"
                      value={inningsSetup.batsman1}
                      onChange={(e) => setInningsSetup({...inningsSetup, batsman1: e.target.value})}
                      required
                    >
                      <option value="">Select batsman</option>
                      {match.teams.find(t => t.name === inningsSetup.battingTeam)?.players.map((player, idx) => (
                        <option 
                          key={idx} 
                          value={player.name}
                          disabled={player.name === inningsSetup.batsman2}
                        >
                          {player.name}
                          {player.isCaptain ? ' (C)' : ''}
                          {player.isWicketkeeper ? ' (WK)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Batsman 2 (Non-striker)</label>
                    <select
                      className="input"
                      value={inningsSetup.batsman2}
                      onChange={(e) => setInningsSetup({...inningsSetup, batsman2: e.target.value})}
                      required
                    >
                      <option value="">Select batsman</option>
                      {match.teams.find(t => t.name === inningsSetup.battingTeam)?.players.map((player, idx) => (
                        <option 
                          key={idx} 
                          value={player.name}
                          disabled={player.name === inningsSetup.batsman1}
                        >
                          {player.name}
                          {player.isCaptain ? ' (C)' : ''}
                          {player.isWicketkeeper ? ' (WK)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="btn-secondary"
                onClick={() => setShowStartModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleStartInnings}
              >
                Start Innings
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showWicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Wicket</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Dismissal Type</label>
                  <select
                    className="input"
                    value={currentBall.wicketType}
                    onChange={(e)=> setCurrentBall({...currentBall, wicketType: e.target.value})}
                    required
                  >
                    <option value="">Select dismissal type</option>
                    <option value="bowled">Bowled</option>
                    <option value="caught">Caught</option>
                    <option value="lbw">LBW</option>
                    <option value="stumped">Stumped</option>
                    <option value="run-out">Run Out</option>
                    <option value="hit-wicket">Hit Wicket</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Batsman Dismissed</label>
                  <select
                    className="input"
                    defaultValue={currentInningData?.batsmen.find(b => b.onStrike && b.status === 'batting')?.name || ''}
                    disabled
                  >
                    {currentInningData?.batsmen
                      .filter(b => b.status === 'batting')
                      .map((batsman, idx) => (
                        <option key={idx} value={batsman.name}>
                          {batsman.name} {batsman.onStrike ? '(On Strike)' : '(Non-striker)'}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="label">New Batsman</label>
                  <select
                    className="input"
                    value={currentBall.batsman}
                    onChange={(e) => setCurrentBall({...currentBall, batsman: e.target.value})}
                    required
                  >
                    <option value="">Select new batsman</option>
                    {match.teams.find(t => t.name === currentInningData?.battingTeam)?.players
                      .filter(player => !currentInningData?.batsmen.some(b => b.name === player.name))
                      .map((player, idx) => (
                        <option key={idx} value={player.name}>
                          {player.name}
                          {player.isCaptain ? ' (C)' : ''}
                          {player.isWicketkeeper ? ' (WK)' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="btn-secondary"
                onClick={() => setShowWicketModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-cricket-wicket text-white hover:bg-red-700 px-4 py-2 rounded-md font-medium transition-all duration-200"
                onClick={() => {
                  if (currentBall.wicketType && currentBall.batsman) {
                    handleBallUpdate({
                      runs: 0,
                      isWicket: true,
                      wicketType: currentBall.wicketType,
                      newBatsmanName: currentBall.batsman
                    });
                    setShowWicketModal(false);
                  }
                }}
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showExtrasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Extras</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Extra Type</label>
                  <select
                    className="input"
                    value={currentBall.extraType}
                    onChange={(e) => setCurrentBall({...currentBall, extraType: e.target.value})}
                    required
                  >
                    <option value="">Select extra type</option>
                    <option value="wide">Wide</option>
                    <option value="no-ball">No Ball</option>
                    <option value="bye">Bye</option>
                    <option value="leg-bye">Leg Bye</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Runs</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4].map(run => (
                      <button
                        key={run}
                        className={`h-12 font-bold rounded-md ${
                          currentBall.runs === run 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={() => setCurrentBall({...currentBall, runs: run})}
                      >
                        {run}
                      </button>
                    ))}
                  </div>
                </div>
                
                {(currentBall.extraType === 'wide' || currentBall.extraType === 'no-ball') && (
                  <div>
                    <label className="label">Extra Runs</label>
                    <select
                      className="input"
                      value={currentBall.extraRuns}
                      onChange={(e) => setCurrentBall({...currentBall, extraRuns: parseInt(e.target.value)})}
                    >
                      <option value="1">1 (Default)</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="btn-secondary"
                onClick={() => setShowExtrasModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 text-white hover:bg-yellow-600 px-4 py-2 rounded-md font-medium transition-all duration-200"
                onClick={() => {
                  if (currentBall.extraType) {
                    handleBallUpdate({
                      runs: currentBall.runs,
                      isExtra: true,
                      extraType: currentBall.extraType,
                      extraRuns: currentBall.extraRuns || 1
                    });
                    setShowExtrasModal(false);
                  }
                }}
              >
                Add Extra
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showEndInningsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle2 size={32} className="text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">
                {currentInnings === 1 ? 'End 1st Innings?' : 'End Match?'}
              </h2>
              <p className="text-gray-600 mb-4">
                {currentInnings === 1 
                  ? 'This will end the current innings and start the second innings.'
                  : 'This will end the match and set its status to completed.'}
              </p>
              
              {currentInningData && (
                <div className="bg-gray-50 rounded p-3 text-left mb-4 border">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Team:</div>
                    <div className="font-medium">{currentInningData.battingTeam}</div>
                    <div className="text-gray-600">Score:</div>
                    <div className="font-medium">
                      {currentInningData.runs}/{currentInningData.wickets}
                    </div>
                    <div className="text-gray-600">Overs:</div>
                    <div className="font-medium">
                      {Math.floor(currentInningData.balls / 6)}.{currentInningData.balls % 6}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-center space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="btn-secondary"
                onClick={() => setShowEndInningsModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEndInnings}
              >
                {currentInnings === 1 ? 'End Innings' : 'End Match'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showBowlerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Change Bowler</h2>
              <p className="text-gray-600 mb-4">End of over. Select the next bowler.</p>
              
              <div>
                <label className="label">New Bowler</label>
                <select
                  className="input"
                  value={newBowler}
                  onChange={(e) => setNewBowler(e.target.value)}
                  required
                >
                  <option value="">Select bowler</option>
                  {match.teams.find(t => t.name === currentInningData?.bowlingTeam)?.players
                    .filter(player => !currentInningData?.bowlers.find(b => b.name === player.name && b.status === 'bowling'))
                    .map((player, idx) => (
                      <option key={idx} value={player.name}>
                        {player.name}
                        {player.isCaptain ? ' (C)' : ''}
                        {player.isWicketkeeper ? ' (WK)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="btn-primary"
                onClick={handleBowlerChange}
                disabled={!newBowler}
              >
                Confirm Bowler
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewBatsmanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">New Batsman</h2>
              <p className="text-gray-600 mb-4">Select the next batsman to come in.</p>
              
              <div>
                <label className="label">New Batsman</label>
                <select
                  className="input"
                  value={newBatsman}
                  onChange={(e) => setNewBatsman(e.target.value)}
                  required
                >
                  <option value="">Select batsman</option>
                  {match.teams.find(t => t.name === currentInningData?.battingTeam)?.players
                    .filter(player => !currentInningData?.batsmen.some(b => b.name === player.name))
                    .map((player, idx) => (
                      <option key={idx} value={player.name}>
                        {player.name}
                        {player.isCaptain ? ' (C)' : ''}
                        {player.isWicketkeeper ? ' (WK)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                className="btn-primary"
                onClick={handleNewBatsman}
                disabled={!newBatsman}
              >
                Confirm Batsman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringPanel;