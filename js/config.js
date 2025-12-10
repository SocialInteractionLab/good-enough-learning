// Experiment Configuration

// Set ratio of high-frequency to low-frequency trials
const HF_RATIO = 4;
const LF_RATIO = 1;

const EXPERIMENT_CONFIG = {
  // Prolific completion codes
  PROLIFIC_COMPLETION_CODE_PARTIAL: 'PLACEHOLDER_PARTIAL', // For participants who end after 5 loops
  PROLIFIC_COMPLETION_CODE_FULL: 'PLACEHOLDER_FULL', // For participants who complete 10 loops
  
  // 5. Set the experiment ID below:
  DATAPIPE_EXPERIMENT_ID: "Y81x5a0mlAt7",
  
  // Experiment settings
  EXPERIMENT_NAME: 'elves_treasure_hunt_learning',
  EXPERIMENT_VERSION: '1.0.0',
  
  // Timing constants (in milliseconds)
  ITI: 500, // Inter-trial interval
  FEEDBACK_TIME: 500,
  TRAINING_THRESHOLD: .8,
  
  // Recall trial threshold
  // Number of correct recall trials required to proceed (out of total recall trials)
  RECALL_THRESHOLD: 8, // Default: all 8 must be correct
  
  // Training loop settings
  MAX_LOOPS: 10, // Maximum number of training+recall loops
  OFFRAMP_LOOP: 5, // Loop number at which to offer offramp (after this many loops)
  
  // Set ratio of high-frequency to low-frequency trials
  HF_RATIO: HF_RATIO,
  LF_RATIO: LF_RATIO,
  EXP_RATIO: `${LF_RATIO}_${HF_RATIO}`,
  TRAINING_TRIALS_PATH: `stimuli/trial_orders/${LF_RATIO}_${HF_RATIO}_training_trials.js`
};

// Set angle and label pairings for all participants 

const angle_label_pairs = [
  { angle: 15, label: 'blit', frequency: 'HF' },
  { angle: 60, label: 'grah', frequency: 'HF' },
  { angle: 105, label: 'pim', frequency: 'LF' },
  { angle: 150, label: 'gorm', frequency: 'LF' },
  { angle: 195, label: 'clate', frequency: 'HF' },
  { angle: 240, label: 'noobda', frequency: 'HF' },
  { angle: 285, label: 'gled', frequency: 'LF' },
  { angle: 330, label: 'noom', frequency: 'LF' }
];

// DataPipe endpoint helper function
// Returns the DataPipe endpoint URL if DATAPIPE_EXPERIMENT_ID is set, otherwise null
EXPERIMENT_CONFIG.getDataPipeEndpoint = function() {
  if (!this.DATAPIPE_EXPERIMENT_ID) {
    return null;
  }
  return `https://pipe.jspsych.org/api/data?experiment_id=${this.DATAPIPE_EXPERIMENT_ID}`;
};
