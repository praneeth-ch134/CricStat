import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isCaptain: {
    type: Boolean,
    default: false
  },
  isWicketkeeper: {
    type: Boolean,
    default: false
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  players: [playerSchema]
});

const batsmanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  runs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  fours: {
    type: Number,
    default: 0
  },
  sixes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['batting', 'out', 'yet-to-bat'],
    default: 'yet-to-bat'
  },
  onStrike: {
    type: Boolean,
    default: false
  }
});

const bowlerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  overs: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  maidens: {
    type: Number,
    default: 0
  },
  runs: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  economy: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['bowling', 'bowled'],
    default: 'bowled'
  }
});

const extrasSchema = new mongoose.Schema({
  wides: {
    type: Number,
    default: 0
  },
  noBalls: {
    type: Number,
    default: 0
  },
  byes: {
    type: Number,
    default: 0
  },
  legByes: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
});

const ballSchema = new mongoose.Schema({
  runs: {
    type: Number,
    default: 0
  },
  isExtra: {
    type: Boolean,
    default: false
  },
  extraType: {
    type: String,
    enum: ['wide', 'no-ball', 'bye', 'leg-bye', ''],
    default: ''
  },
  wicket: {
    type: Boolean,
    default: false
  },
  wicketType: {
    type: String,
    enum: ['bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket', ''],
    default: ''
  },
  batsmanName: {
    type: String,
    default: ''
  },
  bowlerName: {
    type: String,
    default: ''
  }
});

const inningSchema = new mongoose.Schema({
  battingTeam: {
    type: String,
    required: true
  },
  bowlingTeam: {
    type: String,
    required: true
  },
  batsmen: [batsmanSchema],
  bowlers: [bowlerSchema],
  runs: {
    type: Number,
    default: 0
  },
  wickets: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  extras: {
    type: extrasSchema,
    default: () => ({})
  },
  recentBalls: [ballSchema]
});

const tossSchema = new mongoose.Schema({
  winner: {
    type: String,
    required: true
  },
  decision: {
    type: String,
    enum: ['bat', 'bowl'],
    required: true
  }
});

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    trim: true
  },
  overs: {
    type: Number,
    default: 20
  },
  teams: {
    type: [teamSchema],
    required: true,
    validate: {
      validator: (teams) => teams.length === 2,
      message: 'A match must have exactly 2 teams'
    }
  },
  toss: {
    type: tossSchema
  },
  innings: [inningSchema],
  currentInnings: {
    type: Number,
    default: 1,
    min: 1,
    max: 2
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  result: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model('Match', matchSchema);

export default Match;