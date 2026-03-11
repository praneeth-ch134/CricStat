import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronRight } from 'lucide-react';

const MatchCard = ({ match }) => {
  const {
    _id,
    title,
    teams,
    date,
    venue,
    status,
    currentInnings,
    innings,
  } = match;

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

  // Get current score if match is live or completed
  const getCurrentScore = () => {
    if (status === 'upcoming') {
      return null;
    }

    if (!innings || innings.length === 0) {
      return { batting: 'TBA', score: '0/0', overs: '0.0' };
    }

    const currentInning = innings[currentInnings - 1] || innings[0];
    
    return {
      batting: currentInning.battingTeam,
      score: `${currentInning.runs}/${currentInning.wickets}`,
      overs: `${Math.floor(currentInning.balls / 6)}.${currentInning.balls % 6}`
    };
  };

  const score = getCurrentScore();

  return (
    <Link 
      to={`/match/${_id}`}
      className="card group hover:shadow-lg transition-shadow duration-300 animate-fade-in"
    >
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800 truncate">{title}</h3>
          
          {status === 'live' && (
            <span className="live-indicator px-3 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              LIVE
            </span>
          )}
          
          {status === 'completed' && (
            <span className="px-3 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              COMPLETED
            </span>
          )}
          
          {status === 'upcoming' && (
            <span className="px-3 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              UPCOMING
            </span>
          )}
        </div>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <CalendarClock size={14} className="mr-1" />
          <span>{formatDate(date)}</span>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="font-bold text-gray-800">{teams[0].name}</div>
            {score && score.batting === teams[0].name && (
              <div className="text-cricket-scoreboard font-medium">{score.score} ({score.overs} ov)</div>
            )}
          </div>
          
          <div className="px-4 text-xl font-bold text-gray-400">vs</div>
          
          <div className="flex-1 text-right">
            <div className="font-bold text-gray-800">{teams[1].name}</div>
            {score && score.batting === teams[1].name && (
              <div className="text-cricket-scoreboard font-medium">{score.score} ({score.overs} ov)</div>
            )}
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {venue && <div>{venue}</div>}
        </div>
      </div>
      
      <div className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium flex justify-between items-center border-t group-hover:bg-gray-100 transition-colors duration-300">
        <span>{status === 'live' ? 'View live match' : 'View match details'}</span>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Link>
  );
};

export default MatchCard;