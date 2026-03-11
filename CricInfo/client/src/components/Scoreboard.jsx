import React from 'react';

const Scoreboard = ({ match, innings, currentInnings }) => {
  // If no match data is available yet
  if (!match || !innings || innings.length === 0) {
    return (
      <div className="scoreboard animate-pulse">
        <div className="text-center py-10">
          <p className="text-xl">Loading match data...</p>
        </div>
      </div>
    );
  }

  const currentInning = innings[currentInnings - 1];
  
  if (!currentInning) {
    return (
      <div className="scoreboard">
        <div className="text-center py-10">
          <p className="text-xl">Match has not started yet</p>
        </div>
      </div>
    );
  }

  const {
    battingTeam,
    bowlingTeam,
    runs,
    wickets,
    balls,
    extras,
    batsmen,
    bowlers,
    recentBalls
  } = currentInning;

  // Calculate overs (each over has 6 balls)
  const completedOvers = Math.floor(balls / 6);
  const ballsInCurrentOver = balls % 6;
  const oversDisplay = `${completedOvers}.${ballsInCurrentOver}`;
  
  // Calculate run rate
  const runRate = balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00';
  
  // Get current batsmen (usually 2)
  const activeBatsmen = batsmen?.filter(b => b.status === 'batting') || [];
  
  // Current bowler
  const currentBowler = bowlers?.find(b => b.status === 'bowling');

  // Format recent balls for display
  const formatRecentBalls = () => {
    if (!recentBalls || recentBalls.length === 0) return [];
    
    // Get the last over or up to 6 balls
    const lastBalls = recentBalls.slice(-10);
    
    return lastBalls.map(ball => {
      let className = '';
      
      if (ball.wicket) {
        className = 'over-wicket';
      } else if (ball.isExtra) {
        className = ball.extraType === 'wide' ? 'over-wide' : 'over-noball';
      } else if (ball.runs === 0) {
        className = 'over-dot';
      } else if (ball.runs === 4) {
        className = 'over-four';
      } else if (ball.runs === 6) {
        className = 'over-six';
      } else {
        className = 'over-runs';
      }
      
      let display = ball.wicket ? 'W' : 
                   ball.isExtra ? (ball.extraType === 'wide' ? 'Wd' : 'Nb') : 
                   ball.runs.toString();
                   
      return { display, className };
    });
  };
  
  const formattedBalls = formatRecentBalls();

  return (
    <div className="scoreboard">
      {/* Main Score */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{battingTeam}</h2>
          <div className="text-2xl md:text-3xl font-bold mt-1">
            {runs}/{wickets} <span className="text-base font-normal">({oversDisplay} ov)</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm opacity-80">CRR</div>
          <div className="text-xl font-bold">{runRate}</div>
        </div>
      </div>
      
      <div className="h-0.5 bg-white/20 my-4"></div>
      
      {/* Batsmen */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="text-white/70 border-b border-white/10">
              <th className="text-left py-2">Batsman</th>
              <th className="px-3 py-2 text-center">R</th>
              <th className="px-3 py-2 text-center">B</th>
              <th className="px-3 py-2 text-center">4s</th>
              <th className="px-3 py-2 text-center">6s</th>
              <th className="px-3 py-2 text-center">SR</th>
            </tr>
          </thead>
          <tbody>
            {activeBatsmen.map((batsman, idx) => (
              <tr key={idx} className="border-b border-white/10">
                <td className="py-2 font-medium flex items-center">
                  {batsman.name}
                  {batsman.onStrike && <span className="ml-2 text-yellow-400">*</span>}
                </td>
                <td className="px-3 py-2 text-center">{batsman.runs}</td>
                <td className="px-3 py-2 text-center">{batsman.balls}</td>
                <td className="px-3 py-2 text-center">{batsman.fours}</td>
                <td className="px-3 py-2 text-center">{batsman.sixes}</td>
                <td className="px-3 py-2 text-center">
                  {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Current Bowler */}
      {currentBowler && (
        <>
          <div className="h-0.5 bg-white/20 my-4"></div>
          <div>
            <div className="text-sm opacity-70 mb-1">Bowler</div>
            <div className="flex justify-between items-center">
              <div className="font-medium">{currentBowler.name}</div>
              <div>
                {currentBowler.wickets}-{currentBowler.runs} ({Math.floor(currentBowler.balls / 6)}.{currentBowler.balls % 6} ov)
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* This Over */}
      {formattedBalls.length > 0 && (
        <>
          <div className="h-0.5 bg-white/20 my-4"></div>
          <div>
            <div className="text-sm opacity-70 mb-2">Recent</div>
            <div className="flex flex-wrap">
              {formattedBalls.map((ball, idx) => (
                <div 
                  key={idx} 
                  className={`over-ball ${ball.className}`}
                >
                  {ball.display}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Extras */}
      <div className="h-0.5 bg-white/20 my-4"></div>
      <div className="flex justify-between items-center text-sm">
        <div>Extras: {extras?.total || 0} (Wd: {extras?.wides || 0}, NB: {extras?.noBalls || 0}, B: {extras?.byes || 0}, LB: {extras?.legByes || 0})</div>
      </div>
    </div>
  );
};

export default Scoreboard;