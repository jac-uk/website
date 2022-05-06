;(function () {  
  const endingPagePath = './ending-ca.html';
  
  let tests = [];
  let currentTestIndex = 1;
  let currentQuestionIndex = 0;
  let testSummaries = [];
  let isBackSummary = false;

  let $timeRemaining = document.querySelector('#time-remaining');
  let $questionContent = document.querySelector('.question-content');
  let $summaryContent = document.querySelector('.summary-content');
  let $buttonList = document.querySelector('.button-list');
  let $questions = [];
  let $editQuestions = [];
  let $btnSkip = document.querySelector('#btn-skip');
  let $btnNext = document.querySelector('#btn-next');
  let $btnPrev = document.querySelector('#previous-link');
  let $modalSubmit = document.querySelector('.modal-submit');
  let $modalSubmitSuccess = $modalSubmit.querySelector('.govuk-button--success');
  let $modalSubmitCancel = $modalSubmit.querySelector('.deny');
  let $modalTimeExpired = document.querySelector('.modal-time-expired');
  let $modalTimeExpiredSuccess = $modalTimeExpired.querySelector('.govuk-button--success');
  let $modalExit = document.querySelector('.modal-exit');
  let $modalExitSuccess = $modalExit.querySelector('.govuk-button--success');
  let $modalExitCancel = $modalExit.querySelector('.deny');
  

  function init() {
    // load questions from JSON file
    fetch('./data.json')
      .then(res => res.json())
      .then(data => {
        if (data.length) {
          tests = data;
          testSummaries = tests.map(() => []);
          currentTestIndex = 1;
          currentQuestionIndex = 0;
          setCountdown(tests[currentTestIndex].time);

          generateTestHTML(tests[currentTestIndex]);
          generateSummaryHTML(testSummaries[currentTestIndex]);
   
          $questions = document.querySelectorAll('.question-content form');
          $questions.forEach($question => {
            $question.querySelector('.govuk-radios').addEventListener('change', function () {
              $btnNext.disabled = false;
            });
          });

          $editQuestions = document.querySelectorAll('.edit-question');
          $editQuestions.forEach(($question, index) => {
            $question.addEventListener('click', function (e) {
              e.preventDefault();
              handleEditClick(index);
            });
          });

          showQuestion(currentQuestionIndex);
          $buttonList.style.display = 'block';
        } else {
          handleLoadDataError();
        }
      });
  }

  function handleLoadDataError() {
    $questionContent.innerHTML = 'No test';
  }

  function setCountdown(minutes) {
    let countdownDate = new Date(new Date().getTime() + minutes * 60000);
    let now = new Date().getTime();
    let diff = countdownDate - now;
    $timeRemaining.innerHTML = getDiffTimeString(diff);

    // update the count down every 1 second
    let timer = setInterval(function() {      // get today's date and time
      let now = new Date().getTime();
      // find the difference between now and the count down date
      let diff = countdownDate - now;
      $timeRemaining.innerHTML = getDiffTimeString(diff);
      
      // timer will go red in the last 1 minute
      if (diff <= 60000) {
        document.querySelector('.countdown').style.backgroundColor = 'red';
      }

      // if the count down is over 
      if (diff < 0) {
        clearInterval(timer);
        $timeRemaining.innerHTML = '00:00:00';
        $modalTimeExpired.style.display = 'table';
      }
    }, 1000);
  }

  // generate single test HTML
  function generateTestHTML(test) {
    let html = '';
    let questionHtml = '';
    test.questions.forEach((question, questionIndex) => {
      let optionsHtml = '';
      question.options.forEach((option, optionIndex) => {
        optionsHtml += `
          <p>
            <div class="govuk-radios__item-container">
              <div class="govuk-radios__item">
                <input
                  id="question-${questionIndex}-radio-${optionIndex}"
                  name="question-${questionIndex}"
                  type="radio"
                  class="govuk-radios__input"
                  value="${optionIndex}"
                >
                  <label for="question-${questionIndex}-radio-${optionIndex}" class="govuk-label govuk-radios__label">${option.answer}</label>
              </div>
            </div>
          </p>
        `;
      });

      questionHtml += `
        <form>
          <fieldset class="govuk-fieldset">
            <div id="criticalAnalysisRadio" class="govuk-form-group">
              <fieldset aria-describedby="criticalAnalysisRadio__hint" class="govuk-fieldset">
                <legend class="govuk-fieldset__legend govuk-fieldset__legend--m govuk-!-margin-bottom-2"> 
                  ${questionIndex + 1}. ${question.details}
                </legend>
                <span id="criticalAnalysisRadio__hint" class="govuk-hint">
                  Choose one option.
                </span>
                <div class="govuk-radios">
                  ${optionsHtml}
                </div>
              </fieldset>
            </div>
          </fieldset>
        </form>
      `;
    });

    html = questionHtml;
    $questionContent.innerHTML = html;
  }

  // generate single test summary HTML 
  function generateSummaryHTML(answers) {
    let summary = '';
    let questions = '';
    tests[currentTestIndex].questions.forEach((question, index) => {
      let answer = answers[index];
      let answerHtml = (answer !== null && answer !== undefined)
        ? `
          <td class="govuk-table__cell">
            <strong class="govuk-tag">
              COMPLETED
            </strong>
          </td>
        ` 
        : `
          <td class="govuk-table__cell">
            <strong class="govuk-tag govuk-tag--grey">
              SKIPPED
            </strong>
          </td>
        `;
      questions += `
        <tr class="govuk-table__row">
          <td class="govuk-table__cell">
            ${index + 1}.
            <a href="#" class="govuk-link edit-question">${question.details}</a>
          </td>
          ${answerHtml}
        </tr>
      `;
    });

    summary += `
      <h1> Review your answers </h1>
      <table class="govuk-table">
        <caption class="govuk-table__caption govuk-table__caption--m">Questions</caption>
        <thead class="govuk-table__head">
          <tr class="govuk-table__row">
            <th class="govuk-table__header" scope="col"></th>
            <th class="govuk-table__header" scope="col"></th>
          </tr>
        </thead>
        <tbody class="govuk-table__body">
          ${questions}
        </tbody>
      </table>
    `;

    document.querySelector('.summary-content').innerHTML = summary;
  }

  function updateSummaryHTML(answers) {
    let $tags = document.querySelectorAll('.govuk-tag');
    if ($tags) {
      $tags.forEach(($tag, index) => {
        if (answers[index]) {
          $tag.innerHTML = 'COMPLETED';
          $tag.classList.remove('govuk-tag--grey');
        } else {
          $tag.innerHTML = 'SKIPPED';
          $tag.classList.add('govuk-tag--grey');
        }
      });
    }
  }
  
  // check if reached the last question
  function isLastQuestion(index) {
    return index === $questions.length;
  }

  function showQuestion(index) {
    if (isLastQuestion(index)) {
      $btnSkip.style.display = 'none';
      $btnPrev.style.display = 'none';
      $btnNext.innerHTML = "Submit answers";
      $btnNext.disabled = false;
    } else {
      $questions[index].style.display = 'block';
      $btnSkip.style.display = 'inline';
      $btnNext.innerHTML = "Save and continue";
      $btnPrev.style.display = (currentQuestionIndex === 0) ? 'none' : 'block';

      // disable next button when no input is checked
      let checked = $questions[currentQuestionIndex].querySelector('input:checked');
      $btnNext.disabled = checked === null;
    }
  }
  
  function nextPrevQuestion(n) {
    backToTop();
    if (isLastQuestion(currentQuestionIndex)) {
      $modalSubmit.style.display = 'table';
      return;
    }

    // hide the current question
    $questions[currentQuestionIndex].style.display = 'none';
    // increase the current question by 1
    currentQuestionIndex += n;
    
    // if reached the end of the question
    if ((isLastQuestion(currentQuestionIndex) || isBackSummary ) && n > 0) {
      let answers = getAnswers();
      updateSummaryHTML(answers);
      $summaryContent.style.display = 'block';
      if (isBackSummary) {
        currentQuestionIndex = $questions.length;
      }
    }

    // display the correct question
    showQuestion(currentQuestionIndex);
  }
  
  function getAnswers() {
    let answers = [];

    for (let i = 0; i < $questions.length; i++) {
      let $ans = $questions[i].querySelector('input:checked');
      if ($ans) {
        answers.push($ans.value);
      } else {
        answers.push(null);
      }
    }

    return answers;
  }

  function calculateScore(answers) {
    let count = 0;
    let questions = tests[currentTestIndex].questions;
    questions.forEach((question, index) => {
      let answer = answers[index];
      if (!answer) return;
      if (question.correct.toString() === answer.toString()) {
        count += 1;
      }
    });

    return Math.round((count * 100) / questions.length);
  }

  function handleSkipClick(e) {
    nextPrevQuestion(1);
    e.currentTarget.blur();
  }

  function handleNextClick(e) {
    nextPrevQuestion(1);
    e.currentTarget.blur();
  }

  function handlePrevClick(e) {
    e.preventDefault();
    if (currentQuestionIndex === 0) return;
    nextPrevQuestion(-1);
  }

  function handleEditClick(index) {
    currentQuestionIndex = index;
    showQuestion(currentQuestionIndex);
    $summaryContent.style.display = 'none';
    isBackSummary = true;
    backToTop();
  }

  function redirectToEnd() {
    let answers = getAnswers();
    let score = calculateScore(answers);
    window.location.href = `${endingPagePath}?score=${score}`;
  }
 
  $btnPrev.addEventListener('click', handlePrevClick);
  $btnSkip.addEventListener('click', handleSkipClick);
  $btnNext.addEventListener('click', handleNextClick);
  // modal buttons
  $modalSubmitSuccess.addEventListener('click', function () {
    redirectToEnd();
  });
  $modalSubmitCancel.addEventListener('click', function () {
    $modalSubmit.style.display = 'none';
  });
  $modalTimeExpiredSuccess.addEventListener('click', function () {
    redirectToEnd();
  });
  $modalExitSuccess.addEventListener('click', function () {
    redirectToEnd();
  });
  $modalExitCancel.addEventListener('click', function () {
    $modalExit.style.display = 'none;'
  });

  window.addEventListener('beforeunload', function (e) {
    // $modalExit.style.display = 'table';
  });

  init();
} ());
