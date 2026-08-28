// Location of the files owned and hosted by this lab.
var repo_site =
  "https://Pitt-Cognim-Lab.github.io/flanker-task/";

/*
 * Number of repetitions for each of the four stimuli.
 *
 * 60 repetitions × 4 stimuli = 240 test trials.
 */
var reps_per_trial_type = 60;

/* Welcome screen */
var welcome = {
  type: "html-keyboard-response",
  stimulus:
    "Welcome to the experiment. Press any key to begin."
};

/* Instructions */
var instructions = {
  type: "html-keyboard-response",

  stimulus:
    "<p>In this task, you will see five arrows on the screen, " +
    "like the example below.</p>" +
    "<img src='" + repo_site + "img/inc1.png' alt='Example arrows'>" +
    "<p>Press the left arrow key if the middle arrow points left.</p>" +
    "<p>Press the right arrow key if the middle arrow points right.</p>" +
    "<p>Press any key to begin.</p>",

  post_trial_gap: 1000
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

/* Experimental trials */
var test = {
  timeline: [
    {
      type: "image-keyboard-response",

      // 37 is the left-arrow key; 39 is the right-arrow key.
      choices: [37, 39],

      trial_duration: 1500,

      stimulus: jsPsych.timelineVariable("stimulus"),
      data: jsPsych.timelineVariable("data"),

      on_finish: function (data) {
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

/* Final results screen */
var debrief = {
  type: "html-keyboard-response",

  stimulus: function () {
    var task_trials = jsPsych.data.get().filter({
      trial_type: "image-keyboard-response"
    });

    var total_trials = task_trials.count();

    var accuracy = Math.round(
      task_trials.filter({
        correct: true
      }).count() / total_trials * 100
    );

    var congruent_rt = Math.round(
      task_trials.filter({
        correct: true,
        stim_type: "congruent"
      }).select("rt").mean()
    );

    var incongruent_rt = Math.round(
      task_trials.filter({
        correct: true,
        stim_type: "incongruent"
      }).select("rt").mean()
    );

    return (
      "<p>You responded correctly on <strong>" +
      accuracy +
      "%</strong> of the trials.</p>" +

      "<p>Your average response time for congruent trials was " +
      "<strong>" +
      congruent_rt +
      " ms</strong>.</p>" +

      "<p>Your average response time for incongruent trials was " +
      "<strong>" +
      incongruent_rt +
      " ms</strong>.</p>" +

      "<p>Press any key to complete the experiment. Thank you!</p>"
    );
  }
};

/*
 * jsPsych timeline.
 *
 * only the subject-number page and the flanker page.
 */
var timeline = [];

timeline.push(welcome);
timeline.push(instructions);
timeline.push(test);
timeline.push(debrief);
