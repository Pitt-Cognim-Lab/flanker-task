// Location of the files owned and hosted by this lab.
var repo_site =
  "https://Pitt-Cognim-Lab.github.io/flanker-task/";

/*
 * Number of repetitions for each of the four stimuli.
 * 60 repetitions x 4 stimuli = 240 main-test trials.
 */
var reps_per_trial_type = 1;

/* Welcome screen */
var welcome = {
  type: "html-keyboard-response",
  stimulus:
    "Welcome to the experiment. Press any key to begin.",
  data: { phase: "welcome" }
};

/* Instructions shown before the practice trials */
var instructions = {
  type: "html-keyboard-response",

  stimulus:
    "<p>In this task, you will see five arrows on the screen, " +
    "like the example below.</p>" +
    "<img src='" + repo_site + "img/inc1.png' alt='Example arrows'>" +
    "<p>Press the left arrow key if the middle arrow points left.</p>" +
    "<p>Press the right arrow key if the middle arrow points right.</p>" +
    "<p>You will begin with four practice trials.</p>" +
    "<p>Press any key to begin the practice.</p>",

  post_trial_gap: 1000,
  data: { phase: "instructions" }
};

/* Four possible flanker stimuli */
var test_stimuli = [
  {
    stimulus: repo_site + "img/con1.png",
    data: {
      stim_type: "congruent",
      direction: "left"
    }
  },
  {
    stimulus: repo_site + "img/con2.png",
    data: {
      stim_type: "congruent",
      direction: "right"
    }
  },
  {
    stimulus: repo_site + "img/inc1.png",
    data: {
      stim_type: "incongruent",
      direction: "right"
    }
  },
  {
    stimulus: repo_site + "img/inc2.png",
    data: {
      stim_type: "incongruent",
      direction: "left"
    }
  }
];

function scoreFlankerTrial(data) {
  var correct = false;

  if (
    data.direction === "left" &&
    data.key_press === 37 &&
    data.rt > -1
  ) {
    correct = true;
  } else if (
    data.direction === "right" &&
    data.key_press === 39 &&
    data.rt > -1
  ) {
    correct = true;
  }

  data.correct = correct;
}

/* Four practice trials: each stimulus appears once. */
var practice_trials = {
  timeline: [
    {
      type: "image-keyboard-response",
      choices: [37, 39],
      trial_duration: 1500,
      stimulus: jsPsych.timelineVariable("stimulus"),
      data: jsPsych.timelineVariable("data"),

      on_finish: function (data) {
        data.phase = "practice";
        scoreFlankerTrial(data);
      },

      post_trial_gap: function () {
        return Math.floor(Math.random() * 1500) + 500;
      }
    }
  ],

  timeline_variables: test_stimuli,

  sample: {
    type: "fixed-repetitions",
    size: 1
  }
};

/* Choice after each four-trial practice run. */
var practice_choice = {
  type: "html-keyboard-response",

  stimulus:
    "<p>Press <strong>R</strong> to repeat the four practice trials.</p>" +
    "<p>Press <strong>C</strong> to continue to the main task.</p>",

  choices: [82, 67],
  data: { phase: "practice_choice" }
};

/* Repeat the practice only when R was pressed. */
var practice_loop = {
  timeline: [practice_trials, practice_choice],

  loop_function: function (practiceData) {
    var choice = practiceData
      .filter({ phase: "practice_choice" })
      .last(1)
      .values()[0];

    return choice && choice.key_press === 82;
  }
};

var main_task_start = {
  type: "html-keyboard-response",
  stimulus:
    "<p>The main task will now begin.</p>" +
    "<p>Press any key to start.</p>",
  post_trial_gap: 1000,
  data: { phase: "main_instructions" }
};

/* Main experimental trials */
var test = {
  timeline: [
    {
      type: "image-keyboard-response",
      choices: [37, 39],
      trial_duration: 1500,
      stimulus: jsPsych.timelineVariable("stimulus"),
      data: jsPsych.timelineVariable("data"),

      on_finish: function (data) {
        data.phase = "test";
        scoreFlankerTrial(data);
      },

      post_trial_gap: function () {
        return Math.floor(Math.random() * 1500) + 500;
      }
    }
  ],

  timeline_variables: test_stimuli,

  sample: {
    type: "fixed-repetitions",
    size: reps_per_trial_type
  }
};

/*
 * Final screen: congruent mean RT first, incongruent mean RT second.
 * No labels or performance explanation are displayed.
 * It advances automatically after three seconds.
 */
var final_numbers = {
  type: "html-keyboard-response",
  choices: jsPsych.NO_KEYS,
  trial_duration: 3000,
  data: { phase: "final_numbers" },

  stimulus: function () {
    var correct_test_trials = jsPsych.data.get().filter({
      trial_type: "image-keyboard-response",
      phase: "test",
      correct: true
    });

    var congruent_mean = correct_test_trials
      .filter({ stim_type: "congruent" })
      .select("rt")
      .mean();

    var incongruent_mean = correct_test_trials
      .filter({ stim_type: "incongruent" })
      .select("rt")
      .mean();

    var congruent_rt =
      typeof congruent_mean === "number" &&
      isFinite(congruent_mean)
        ? Math.round(congruent_mean)
        : "--";

    var incongruent_rt =
      typeof incongruent_mean === "number" &&
      isFinite(incongruent_mean)
        ? Math.round(incongruent_mean)
        : "--";

    return (
      "<div style='font-size:48px;line-height:1.8;text-align:center;'>" +
      "<div>" + congruent_rt + "</div>" +
      "<div>" + incongruent_rt + "</div>" +
      "</div>"
    );
  }
};

/* Experiment structure */
var timeline = [];

timeline.push(welcome);
timeline.push(instructions);
timeline.push(practice_loop);
timeline.push(main_task_start);
timeline.push(test);
timeline.push(final_numbers);
