// Main Experiment Script

// Initialize jsPsych
const jsPsych = initJsPsych({
});

// Generate a random subject ID
const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

// capture info from Prolific
var prolific_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
    subject_id: subject_id,
    prolific_id: prolific_id,
    study_id: study_id,
    session_id: session_id,
    experiment_name: EXPERIMENT_CONFIG.EXPERIMENT_NAME,
    experiment_version: EXPERIMENT_CONFIG.EXPERIMENT_VERSION,
    experiment_lf_ratio: EXPERIMENT_CONFIG.LF_RATIO,
    experiment_hf_ratio: EXPERIMENT_CONFIG.HF_RATIO
});

// ============================================
// Phase 1: Consent Page
// ============================================

const consent_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
        <div class="consent-text">
        <h2>Consent Agreement</h2>
       <p>
            Please read this consent agreement carefully before deciding whether to participate in this experiment. 
          </p>
          <p>
            <strong>Description:</strong> You are invited to participate in a research study about language and language learning. The purpose of the research is to understand how people learn new words. This research will be conducted through the Prolific platform, including participants from the US, UK, and Canada. If you decide to participate in this research, you will learn and use new words. 
          </p> 
          <p>
            <strong>Time Involvement:</strong> The task will last the amount of time advertised on Prolific. You are free to withdraw from the study at any time. 
          </p>
          <p>
            <strong>Risks and Benefits:</strong> Study data will be stored securely, in compliance with Stanford University standards, minimizing the risk of confiden-tiality breach. This study advances our scientific understanding of how people learn new languages. We cannot and do not guarantee or promise that you will receive any benefits from this study. 
          </p>
          <p>
            <strong>Compensation:</strong> You will receive payment in the amount advertised on Prolific. If you do not complete this study, you will receive prorated payment based on the time that you have spent. Additionally, you may be eligible for bonus payments as described in the instructions. 
          </p>
          <p>
            <strong>Participant's Rights:</strong> If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. The alternative is not to participate. You have the right to refuse to answer particular questions. The results of this research study may be presented at scientific or professional meetings or published in scientific journals. Your individual privacy will be maintained in all published and writ-ten data resulting from the study. In accordance with scientific norms, the data from this study may be used or shared with other researchers for future research (after removing personally identifying information) without additional consent from you. 
          </p>
          <p>
            <strong>Contact Information:</strong> If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact the Protocol Director, Robert Hawkins (<a href="mailto:rdhawkins@stanford.edu">rdhawkins@stanford.edu</a>, 217-549-6923).
            </p>
          <p>
            <strong>Independant Contact:</strong> If you are not satisfied with how this study is being conducted, or if you have any concerns, com-plaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at 650-723-2480 or toll free at 1-866-680-2906, or email at irbnonmed@stanford.edu. You can also write to the Stanford IRB, Stanford University, 1705 El Camino Real, Palo Alto, CA 94306. Please save or print a copy of this page for your records. 
          </p>
          <p>
            <strong>If you agree to participate in this research, please click "I agree"</strong>
          </p></br>
    </div>
  `,
  choices: ['I agree', 'I do not agree'],
  button_html: function(choice, choice_index) {
    const buttonClass = choice_index === 0 ? 'consent-button agree' : 'consent-button disagree';
    return `<button class="${buttonClass}">${choice}</button>`;
  },
  data: {
    trial_type: 'consent'
  },
  on_finish: function(data) {
    data.consent_response = data.response === 0 ? 'agree' : 'disagree';
    data.consent_timestamp = new Date().toISOString();
    
    if (data.response === 1) {
      jsPsych.abortExperiment(`
        <div class="instruction-text">
          <h2>Thank you</h2>
          <p>You have chosen not to participate. Please close this tab and return the task in Prolific.</p>
        </div>
      `);
    }
  }
};

// ============================================
// Phase 2: Overall Introduction
// ============================================

const introduction_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instruction-text">
        <h2>Welcome to the Elves Treasure Hunt Experiment</h2>
        <p>Thank you for your participation. In order to complete today's task, you're going to play a game. You've been asked to be a guide for a squad of Elves looking to find buried treasure. Their compass navigator has gone missing and there's not much time before winter makes the hunt impossible.</p>
        <p>Here's the situation. The worker elves only know Elvish. It's your job to learn to read the compass as quickly and accurately as possible. First you'll learn how to give directions. Good luck!</p>
        <p class="prompt-text">Press any key to continue</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'introduction'
    }
  };

// ============================================
// Phase 3: Exposure Trials
// ============================================

const exposure_instructions_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instruction-text">
        <h2>Practicing Elvish Directions</h2>
        <p>The Elves use 8 principal directions to navigate. You're about to see the names for each direction, and practice giving directions by typing in the name of the direction.</p>
        <p class="prompt-text">Press any key to begin</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'exposure_instructions'
    }
  };

// Exposure trial - loops until participant gets it correct
const exposure_trial = {
    timeline: [{
        type: jsPsychSurveyHtmlForm,
        html: function() {
            // Get angle and label from timeline variables
            const angle = jsPsych.evaluateTimelineVariable('angle');
            const label = jsPsych.evaluateTimelineVariable('label');
            
            const compassHTML = createCompassHTML(angle);
            return `
              <div class="compass-container">
                ${compassHTML}
                <p class="compass-instruction">This direction is called <span class="compass-label">${label}</span></p>
                <p style="font-size: 16px; margin: 20px 0;">Type the name of this direction:</p>
                <input type="text" id="exposure-response" name="exposure-response" class="compass-input" autocomplete="off" autofocus />
                <div id="exposure-feedback" style="display: none; margin-top: 20px; font-size: 16px; color: #d32f2f;"></div>
              </div>
            `;
        },
        data: {
            trial_type: 'exposure'
        },
        on_load: function() {
            // Hide feedback when trial loads
            const feedbackDiv = document.getElementById('exposure-feedback');
            if (feedbackDiv) {
                feedbackDiv.style.display = 'none';
            }
            
            // Wait for jsPsych to set up the form, then add our handler
            setTimeout(function() {
                const form = document.getElementById('jspsych-survey-html-form');
                const target = jsPsych.evaluateTimelineVariable('label');
                const responseInput = document.getElementById('exposure-response');
                const feedbackDiv = document.getElementById('exposure-feedback');
                
                if (form && responseInput && feedbackDiv) {
                    // Intercept form submission
                    form.addEventListener('submit', function(e) {
                        // If feedback is already visible, allow submission to proceed
                        if (feedbackDiv.style.display === 'block') {
                            return;
                        }
                        
                        const response = responseInput.value.toLowerCase().trim();
                        const isCorrect = response === target.toLowerCase();
                        
                        // If incorrect, prevent submission and show feedback
                        if (!isCorrect && response !== '') {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            
                            const originalResponse = responseInput.value.trim();
                            feedbackDiv.textContent = `You entered: ${originalResponse}`;
                            feedbackDiv.style.display = 'block';
                        }
                        // If correct, allow normal submission (don't prevent default)
                    }, true); // Use capture phase to intercept before jsPsych
                }
            }, 100);
        },
        on_finish: function(data) {
            const target = jsPsych.evaluateTimelineVariable('label');
            const angle = jsPsych.evaluateTimelineVariable('angle');
            const response = data.response['exposure-response'].toLowerCase().trim();
            
            data.is_correct = response === target.toLowerCase() ? 1 : 0;
            data.response_text = response;
            data.target = target;
            data.angle = angle;
        }
    }],
    autofocus: 'exposure-response',
    loop_function: function(data) {
      const values = data.values();
      return values.length > 0 && values[values.length - 1].is_correct === 0;
  }
}

const exposure_trials = {
    timeline: [exposure_trial],
    timeline_variables: angle_label_pairs,
    randomize_order: false
};


// ============================================
// Phase 4: Familiarization Trials
// ============================================

// Track familiarization block state
let familiarization_state = {
  first_attempt_errors: 0,
  attempted_trials: new Set(),
  block_iteration: 0,
  trial_number: 0
};

// Track recall block state
let recall_state = {
  outer_loop_iteration: 0,
  trial_number: 0,
  current_iteration_trials: [],
  participant_chose_to_continue: null, // null = not yet offered, true = chose to continue, false = chose to end
  completed_loops: 0, // Track how many loops were actually completed
  training_loop_first_iteration: true // Track if this is the first training loop iteration
};

const familiarization_instructions_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Learning Elvish Directions</h2>
      <p>Let's start learning to read the compass. You will see a direction and two potential words for that direction. Type the word that you think is correct. We'll keep practicing until you've learned all the directions. A buzz will play if you got the trial incorrect.</p>
      <p class="prompt-text">Press any key to begin</p>
    </div>
  `,
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'familiarization_instructions'
  }
};

// Familiarization trial - loops until participant gets it correct
const familiarization_trial = {
  timeline: [{
    type: jsPsychSurveyHtmlForm,
    html: function() {
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel');
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel');
      const target = jsPsych.evaluateTimelineVariable('target');
      const compassHTML = createCompassHTML(angle);

      return `
        <div class="compass-container">
          ${compassHTML}
          <p class="compass-instruction">Which label? <span class="compass-label">${leftLabel}</span> or <span class="compass-label">${rightLabel}</span></p>
          <p style="font-size: 16px; margin: 20px 0;">Type the name of the correct label:</p>
          <input type="text" id="familiarization-response" name="familiarization-response" class="compass-input" autocomplete="off" autofocus />
        </div>
      `;
    },
    autofocus: 'familiarization-response',
    data: {
      trial_type: 'familiarization'
    },
    on_finish: function(data) {
      const target = jsPsych.evaluateTimelineVariable('target');
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel');
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel');
      const response = data.response['familiarization-response'].toLowerCase().trim();
      const isCorrect = response === target.toLowerCase();
      
      const trialId = `${angle}_${target}_${leftLabel}_${rightLabel}`;
      const isFirstAttempt = !familiarization_state.attempted_trials.has(trialId);
      
      if (isFirstAttempt) {
        familiarization_state.attempted_trials.add(trialId);
        familiarization_state.trial_number++;
        if (!isCorrect) {
          familiarization_state.first_attempt_errors++;
        }
      }
      
      if (!isCorrect) {
        const audio = new Audio('stimuli/audio/buzz.wav');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      data.is_correct = isCorrect ? 1 : 0;
      data.response_text = response;
      data.target = target;
      data.angle = angle;
      data.leftLabel = leftLabel;
      data.rightLabel = rightLabel;
      data.is_first_attempt = isFirstAttempt ? 1 : 0;
      data.first_attempt_errors_count = familiarization_state.first_attempt_errors;
      data.familiarization_block_iteration = familiarization_state.block_iteration;
      data.familiarization_trial_number = familiarization_state.trial_number;
    }
  }],
  loop_function: function(data) {
    // Get all trial data from this loop iteration
    const values = Array.from(data.values());
    if (values.length === 0) {
      return false;
    }
    // Get the most recent trial (last in the array)
    const lastTrial = values[values.length - 1];
    // Only loop if the last trial was incorrect
    // Ensure is_correct exists and is 0 (incorrect)
    const shouldLoop = lastTrial.hasOwnProperty('is_correct') && 
                       (lastTrial.is_correct === 0 || lastTrial.is_correct === false);
    return shouldLoop;
  }
}

// Randomly select one of the trial blocks
const selectedTrainingBlockIndex = Math.floor(Math.random() * training_trials_data.length);
const selectedTrainingBlock = training_trials_data[selectedTrainingBlockIndex];
const selectedTrainingTrials = selectedTrainingBlock.trials;

jsPsych.data.addProperties({
  selected_training_block_id: selectedTrainingBlock.block_id
});

const familiarization_trials_inner = {
  timeline: [familiarization_trial],
  timeline_variables: selectedTrainingTrials,
  randomize_order: true
};

// Reset state at the start of each block iteration
const familiarization_reset_trial = {
  type: jsPsychCallFunction,
  func: function() {
    familiarization_state.first_attempt_errors = 0;
    familiarization_state.attempted_trials.clear();
    familiarization_state.trial_number = 0;
  }
};

// ============================================
// Phase 6: Offramp Trial (after 5 loops)
// ============================================

const offramp_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Training Progress Update</h2>
      <p>Great work so far! Take a moment to rest your eyes and hands.</p>
      <p>You now have a choice:</p>
      <ul style="text-align: left; max-width: 600px; margin: 20px auto;">
        <li style="margin: 15px 0;"><strong>End now:</strong> You can choose to end the experiment here and receive partial payment. You'll do one more recall test to see how well you've learned, then complete a brief survey and receive your completion code.</li>
        <li style="margin: 15px 0;"><strong>Continue:</strong> You can continue practicing until you've learned all the words or your time is up to receive the full payment.</li>
      </ul>
      <p>What would you like to do?</p>
    </div>
  `,
  choices: ['End now and get partial payment', 'Continue practicing for full payment'],
  button_html: function(choice, choice_index) {
    const buttonClass = choice_index === 0 ? 'consent-button disagree' : 'consent-button agree';
    return `<button class="${buttonClass}">${choice}</button>`;
  },
  data: {
    trial_type: 'offramp'
  },
  on_finish: function(data) {
    // choice_index 0 = "End now", 1 = "Continue"
    recall_state.participant_chose_to_continue = data.response === 1;
    data.offramp_choice = data.response === 1 ? 'continue' : 'end';
    data.offramp_loop_number = recall_state.outer_loop_iteration;
  }
};

// Conditional offramp: only show after 5 training loops (before recall)
const conditional_offramp = {
  timeline: [offramp_trial],
  conditional_function: function() {
    // Show offramp if:
    // 1. We've completed exactly OFFRAMP_LOOP training loops
    // 2. We haven't shown it before (participant_chose_to_continue is null)
    const shouldShow = recall_state.outer_loop_iteration === EXPERIMENT_CONFIG.OFFRAMP_LOOP &&
                       recall_state.participant_chose_to_continue === null;
    
    return shouldShow;
  }
}

const familiarization_trials = {
  timeline: [familiarization_reset_trial, familiarization_trials_inner, conditional_offramp],
  on_timeline_start: function() {
    familiarization_state.block_iteration++;
    // Clear recall trials tracking at start of outer loop
    recall_state.current_iteration_trials = [];
    
    // Increment counter for first iteration (on_timeline_start only runs once)
    if (recall_state.training_loop_first_iteration) {
      recall_state.outer_loop_iteration++;
      recall_state.training_loop_first_iteration = false;
    }
    // Log the current iteration number (counter is already set correctly)
    console.log(`Training loop iteration ${recall_state.outer_loop_iteration} starting`);
  },
  loop_function: function(data) {
    // Get the current iteration number (the one that just completed)
    const completedIteration = recall_state.outer_loop_iteration;
    
    // Increment counter for the next iteration (this runs after current iteration completes)
    recall_state.outer_loop_iteration++;
    console.log(`Training loop iteration ${completedIteration} completed, counter incremented to ${recall_state.outer_loop_iteration} for next iteration`);
    
    const totalTrials = selectedTrainingTrials.length;
    const firstAttemptErrors = familiarization_state.first_attempt_errors;
    const errorRate = firstAttemptErrors / totalTrials;
    const correctRate = 1 - errorRate;
    const shouldLoopByThreshold = correctRate < EXPERIMENT_CONFIG.TRAINING_THRESHOLD;
    
    console.log(`Familiarization block iteration ${familiarization_state.block_iteration} completed: ${firstAttemptErrors}/${totalTrials} first-attempt errors (${(errorRate * 100).toFixed(1)}% error rate, ${(correctRate * 100).toFixed(1)}% correct rate). Training threshold met: ${!shouldLoopByThreshold}`);
    
    // Check if counter reached 10 (safety limit) - check the NEXT iteration value
    if (recall_state.outer_loop_iteration >= 10) {
      console.log(`Training loop will reach maximum (10) on next iteration. Forcing exit to recall and survey.`);
      return false;
    }
    
    // Check offramp choice if we just completed loop 5
    // The offramp appears during iteration 5 (when counter is 5), and we check the choice after iteration 5 completes
    if (completedIteration === 5) {
      if (recall_state.participant_chose_to_continue === false) {
        // Participant chose to end at offramp
        console.log(`Participant chose to end at loop 5. Exiting training loop to proceed to recall.`);
        return false;
      } else if (recall_state.participant_chose_to_continue === true) {
        // Participant chose to continue - check if training threshold met
        if (!shouldLoopByThreshold) {
          console.log(`Participant chose to continue at loop 5, and training threshold met. Exiting training loop to proceed to recall.`);
          return false;
        } else {
          console.log(`Participant chose to continue at loop 5, but training threshold not met. Continuing training loop.`);
          return true;
        }
      }
    }
    
    // Store block completion data
    const values = data.values();
    if (values.length > 0) {
      const lastTrial = values[values.length - 1];
      lastTrial.block_first_attempt_errors = firstAttemptErrors;
      lastTrial.block_total_trials = totalTrials;
      lastTrial.block_error_rate = errorRate;
      lastTrial.block_correct_rate = correctRate;
      lastTrial.block_will_loop = shouldLoopByThreshold ? 1 : 0;
      lastTrial.training_loop_iteration = completedIteration;
    }
    
    // Use normal training threshold logic
    return shouldLoopByThreshold;
  }
};

// ============================================
// Phase 5: Recall Trials
// ============================================

const recall_instructions_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Recalling Elvish Directions</h2>
      <p>You're getting pretty good at reading the compass! Now you'll practice recalling the directions you've learned. You will see a direction and you'll need to type the name of the direction. Press any key to begin.</p>
    </div>
  `,
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'recall_instructions'
  }
}

const recall_trial = {
  type: jsPsychSurveyHtmlForm,
  html: function() {
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const label = jsPsych.evaluateTimelineVariable('label');
    const compassHTML = createCompassHTML(angle);
    return `
      <div class="compass-container">
        ${compassHTML}
        <p class="compass-instruction">What is this direction called?</p>
        <input type="text" id="recall-response" name="recall-response" class="compass-input" autocomplete="off" autofocus />
      </div>
    `;
  },
  autofocus: 'recall-response',
  data: {
    trial_type: 'recall'
  },
  on_finish: function(data) {
    const label = jsPsych.evaluateTimelineVariable('label');
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const response = data.response['recall-response'].toLowerCase().trim();
    const isCorrect = response === label.toLowerCase() ? 1 : 0;
    
    data.is_correct = isCorrect;
    data.response_text = response;
    data.target = label;
    data.angle = angle;
    data.outer_loop_iteration = recall_state.outer_loop_iteration;
    data.recall_trial_number = recall_state.trial_number;
    
    recall_state.current_iteration_trials.push({
      angle: angle,
      target: label,
      is_correct: isCorrect,
      response: response
    });
  }
}

const recall_trials = {
  timeline: [recall_trial],
  timeline_variables: angle_label_pairs,
  randomize_order: true,
  on_timeline_start: function() {
    recall_state.current_iteration_trials = [];
    recall_state.trial_number = 0;
    console.log('Starting recall trials - cleared tracking array');
  },
  on_trial_start: function() {
    recall_state.trial_number++;
  }
}

// Data saving trial after each recall test
const save_data_recall = EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID ? {
  type: jsPsychPipe,
  action: "save",
  experiment_id: EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID,
  filename: () => `inprog_${recall_state.outer_loop_iteration}_${filename}`,
  wait_message: "Saving your data and checking answers. Please do not close this page.",
  data_string: () => jsPsych.data.get().csv(),
  data: {
    trial_type: 'save_data_recall'
  },
  on_finish: function(data) {
    data.recall_iteration = recall_state.outer_loop_iteration;
  }
} : null;

// Continue trial showing feedback based on recall performance
const continue_after_save_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    // Calculate recall performance
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    // Determine if they'll loop again or proceed to survey
    // This mirrors the logic in familiarization_trials_outer_loop.loop_function
    // Note: completed_loops will be incremented in on_timeline_finish if threshold is met
    const willCompleteThisLoop = thresholdMet ? 1 : 0;
    const willReachMaxLoops = (recall_state.completed_loops + willCompleteThisLoop) >= EXPERIMENT_CONFIG.MAX_LOOPS;
    // Safety limit: outer_loop_iteration is incremented in familiarization_trials loop_function
    // If it's >= 10, the outer loop will exit. If it's 9, the next iteration would be 10.
    const willReachSafetyLimit = recall_state.outer_loop_iteration >= 10;
    const participantEnded = recall_state.participant_chose_to_continue === false;
    
    // Determine if they'll loop (mirroring loop_function logic):
    // - Exit if threshold met (always, regardless of offramp choice)
    // - Exit if safety limit reached
    // - Exit if participant ended at offramp
    // - Exit if max loops reached
    // - Continue if threshold not met and none of the above
    const willLoop = !thresholdMet && !willReachMaxLoops && !willReachSafetyLimit && !participantEnded;
    
    // Determine message based on performance and next step
    let message;
    if (thresholdMet) {
      // Threshold met - always proceeding to survey
      message = "Excellent! You've successfully learned all the directions. You'll now complete a brief survey about your experience.";
    } else if (willReachSafetyLimit) {
      // Safety limit reached (10/10 loops)
      message = `You got ${correctRecallTrials}/${totalRecallTrials} directions correct. You have reached the maximum time for this study. Next we will ask you a couple questions about your experience.`;
    } else if (participantEnded) {
      // Participant chose to end at offramp
      message = `You got ${correctRecallTrials}/${totalRecallTrials} directions correct. You'll now complete a brief survey about your experience.`;
    } else if (willReachMaxLoops) {
      // Max loops reached (but not safety limit)
      message = `You got ${correctRecallTrials}/${totalRecallTrials} directions correct. You'll now complete a brief survey about your experience.`;
    } else {
      // Threshold not met, will loop again - only case where we mention "keep practicing"
      message = `You got ${correctRecallTrials}/${totalRecallTrials} directions correct. Let's keep practicing to help you learn all the directions!`;
    }
    
    return `
      <div class="instruction-text">
        <p class="prompt-text">${message}</p>
        <p class="prompt-text" style="margin-top: 20px;">Press any key to continue</p>
      </div>
    `;
  },
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'continue_after_save'
  },
  on_finish: function(data) {
    // Store recall performance data
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    data.recall_correct = correctRecallTrials;
    data.recall_total = totalRecallTrials;
    data.recall_threshold_met = thresholdMet ? 1 : 0;
    data.recall_iteration = recall_state.outer_loop_iteration;
  }
};

// Build the timeline for saving after recall
const save_after_recall_timeline = [];
if (EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID) {
  if (save_data_recall) {
    save_after_recall_timeline.push(save_data_recall);
  }
  save_after_recall_timeline.push(continue_after_save_trial);
}

// Build the timeline for a single training+recall loop
// Structure: Training (includes offramp if loop 5) → Recall → check threshold → loop decision
const single_loop_timeline = [familiarization_trials, 
  recall_instructions_trial, 
  recall_trials,
  ...save_after_recall_timeline];

const familiarization_trials_outer_loop = {
  timeline: single_loop_timeline,
  on_timeline_start: function() {
    // Clear recall trials tracking at start of each outer loop
    recall_state.current_iteration_trials = [];
    console.log(`Starting outer loop (training counter is at ${recall_state.outer_loop_iteration})`);
  },
  on_timeline_finish: function() {
    // Mark this loop as completed (only if threshold was met)
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    if (thresholdMet) {
      recall_state.completed_loops++;
    }
  },
  loop_function: function(data) {
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    // Check if training counter reached 10 (safety limit)
    if (recall_state.outer_loop_iteration >= 10) {
      console.log(`Training counter reached 10 (safety limit). Stopping outer loop and proceeding to survey.`);
      return false;
    }
    
    // Check if participant chose to end at offramp
    const participantEnded = recall_state.participant_chose_to_continue === false;
    
    // If participant chose to end, don't loop (they'll go to survey after recall)
    if (participantEnded) {
      console.log(`Participant chose to end at training loop ${recall_state.outer_loop_iteration}. They will complete recall then go to survey.`);
      return false;
    }
    
    // Check if we've reached max outer loops (this is separate from training loop counter)
    // Note: completed_loops was already incremented in on_timeline_finish if threshold was met
    const reachedMaxLoops = recall_state.completed_loops >= EXPERIMENT_CONFIG.MAX_LOOPS;
    
    // Exit conditions (in priority order):
    // 1. If threshold met, always exit to survey (regardless of offramp choice)
    if (thresholdMet) {
      console.log(`Recall threshold met (${correctRecallTrials}/${totalRecallTrials}). Exiting to survey.`);
      return false;
    }
    
    // 2. If threshold not met, continue looping (unless max loops reached)
    // Continue looping if threshold not met AND not at max loops
    const shouldLoop = !thresholdMet && !reachedMaxLoops;
    
    console.log(`Outer loop completed: ${correctRecallTrials}/${totalRecallTrials} recall trials correct (required: ${requiredCorrect}). Threshold met: ${thresholdMet}. Training loops: ${recall_state.outer_loop_iteration}. Completed loops: ${recall_state.completed_loops}. Reached max outer loops: ${reachedMaxLoops}. Participant ended: ${participantEnded}. Will loop again: ${shouldLoop}`);
    console.log('Recall trials from this iteration:', recallTrials.map(t => ({angle: t.angle, target: t.target, is_correct: t.is_correct})));
    
    // Store loop completion data
    const values = data.values();
    if (values.length > 0) {
      const lastTrial = values[values.length - 1];
      lastTrial.outer_loop_recall_correct = correctRecallTrials;
      lastTrial.outer_loop_recall_total = totalRecallTrials;
      lastTrial.outer_loop_recall_threshold = requiredCorrect;
      lastTrial.outer_loop_threshold_met = thresholdMet ? 1 : 0;
      lastTrial.outer_loop_will_loop = shouldLoop ? 1 : 0;
      lastTrial.outer_loop_iteration = recall_state.outer_loop_iteration;
      lastTrial.reached_max_loops = reachedMaxLoops ? 1 : 0;
      lastTrial.participant_ended = participantEnded ? 1 : 0;
    }
    
    return shouldLoop;
  }
}

// ============================================
// Phase 7: Post-Training Survey
// ============================================

const survey_trial = {
  type: jsPsychSurveyHtmlForm,
  preamble: `
    <div class="instruction-text">
      <h2>Training Complete!</h2>
      <p>Thank you for completing the training. Please answer a few brief questions about your experience.</p>
    </div>
  `,
  html: `
    <div style="text-align: left; max-width: 600px; margin: 0 auto;">
      <p><label>How difficult did you find the training task? (1 = Very Easy, 7 = Very Difficult)</label><br/>
      <input type="number" name="difficulty" min="1" max="7" required /></p>
      
      <p><label>How confident are you in your ability to recall the direction names? (1 = Not at all confident, 7 = Very confident)</label><br/>
      <input type="number" name="confidence" min="1" max="7" required /></p>
      
      <p><label>What did you think this study was about?</label><br/>
      <textarea name="study_purpose" rows="4" cols="50" style="width: 100%;" required></textarea></p>
      
      <p><label>Did you have any strategies for learning the words?</label><br/>
      <textarea name="learning_strategies" rows="4" cols="50" style="width: 100%;" required></textarea></p>
      
      <p><label>Any additional comments or feedback?</label><br/>
      <textarea name="comments" rows="4" cols="50" style="width: 100%;"></textarea></p>
    </div>
  `,
  data: {
    trial_type: 'survey'
  },
  on_finish: function(data) {
    // Store survey responses
    data.survey_difficulty = data.response.difficulty;
    data.survey_confidence = data.response.confidence;
    data.survey_study_purpose = data.response.study_purpose || '';
    data.survey_learning_strategies = data.response.learning_strategies || '';
    data.survey_comments = data.response.comments || '';
    data.actual_loops_completed = recall_state.completed_loops;
  }
};

// ============================================
// Data Saving & Final Trial
// ============================================

const save_data_end = EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID ? {
  type: jsPsychPipe,
  action: "save",
  experiment_id: EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID,
  filename: `completed_${filename}`,
  data_string: () => jsPsych.data.get().csv()
} : null;

const final_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
      // Determine which completion code to use
      // Partial payment: Only if participant explicitly ended early (chose to end at offramp)
      // Full payment: If they passed threshold, reached safety limit, or reached max loops
      const explicitlyEndedEarly = recall_state.participant_chose_to_continue === false;
      const isFullCompletion = !explicitlyEndedEarly; // Full payment for all other exit reasons
      
      const completionCode = isFullCompletion ? 
        EXPERIMENT_CONFIG.PROLIFIC_COMPLETION_CODE_FULL : 
        EXPERIMENT_CONFIG.PROLIFIC_COMPLETION_CODE_PARTIAL;
      const completionType = isFullCompletion ? 'full' : 'partial';
      
      // Store completion info in data
      jsPsych.data.addProperties({
        completion_type: completionType,
        completion_code: completionCode,
        final_loops_completed: recall_state.completed_loops,
        explicitly_ended_early: explicitlyEndedEarly ? 1 : 0,
        reached_safety_limit: recall_state.outer_loop_iteration >= 10 ? 1 : 0
      });
      
      return `
        <div class="instruction-text">
          <h2>Thank you for participating!</h2>
          <p><strong>Your completion code: ${completionCode}</strong></p>
          <p><a href="https://app.prolific.co/submissions/complete?cc=${completionCode}">Click here to return to Prolific and complete the study</a>.</p>
        </div>
      `;
    },
    choices: "NO_KEYS"
  };

// ============================================
// Build Timeline
// ============================================

const timeline = [
  consent_trial,
  introduction_trial,
  exposure_instructions_trial,
  exposure_trials,
  familiarization_instructions_trial,
  familiarization_trials_outer_loop,
  survey_trial
];

if (save_data_end) {
  timeline.push(save_data_end);
}

timeline.push(final_trial);

// Start the experiment
jsPsych.run(timeline);