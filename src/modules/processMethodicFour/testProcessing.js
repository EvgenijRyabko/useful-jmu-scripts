const getSimpleBall = (numberQuestion, ball, conditionArr, reverseMaxBall) => {
  if (conditionArr.includes(numberQuestion))
    return reverseMaxBall ? Math.abs(ball - reverseMaxBall) : ball;
  return 0;
};

const getBallByQuestion = (numberQuestion, ball, conditionObj) => {
  for (const key in conditionObj) {
    if (conditionObj[key].includes(numberQuestion) && ball === Number(key)) return 1;
  }
  return 0;
};

export const processAdaptability = (questionsArr) => {
  const resultObj = {
    directBall: 0,
    reverseBall: 0,
    studyGroupsBall: 0,
    studyBall: 0,
  };

  for (const question of questionsArr) {
    const numberQuestion = parseInt(question.numberQuestion);
    const ball = parseInt(question.ball);

    resultObj.directBall += getSimpleBall(numberQuestion, ball, [1, 3, 4, 6, 9, 10, 13, 14]);
    resultObj.reverseBall += getSimpleBall(numberQuestion, ball, [2, 5, 7, 8, 11, 12, 15, 16], 2);
    resultObj.studyGroupsBall += getSimpleBall(numberQuestion, ball, [1, 3, 4, 6]);
    resultObj.studyGroupsBall += getSimpleBall(numberQuestion, ball, [2, 5, 7, 8], 2);
    resultObj.studyBall += getSimpleBall(numberQuestion, ball, [9, 10, 13, 14]);
    resultObj.studyBall += getSimpleBall(numberQuestion, ball, [11, 12, 15, 16], 2);
  }

  return resultObj;
};

export const processSuicide = (questionsArr) => {
  const resultObj = {
    demonstrativenessBall: 0,
    affectivityBall: 0,
    uniquenessBall: 0,
    insolvencyBall: 0,
    pessimismBall: 0,
    barriersBall: 0,
    maximalismBall: 0,
    perspectiveBall: 0,
    antisuicidalBall: 0,
    totalSuicideBall: 0,
  };

  for (const question of questionsArr) {
    const numberQuestion = parseInt(question.numberQuestion);
    const ball = parseInt(question.ball);

    resultObj.demonstrativenessBall += getBallByQuestion(numberQuestion, ball, {
      1: [12, 14, 20, 22, 27],
    });
    resultObj.affectivityBall += getBallByQuestion(numberQuestion, ball, {
      1: [1, 10, 20, 23, 28, 29],
    });
    resultObj.uniquenessBall += getBallByQuestion(numberQuestion, ball, {
      1: [1, 12, 14, 22, 27],
    });
    resultObj.insolvencyBall += getBallByQuestion(numberQuestion, ball, {
      1: [2, 3, 6, 7, 17],
    });
    resultObj.pessimismBall += getBallByQuestion(numberQuestion, ball, {
      1: [5, 11, 13, 15, 17, 22, 25],
    });
    resultObj.barriersBall += getBallByQuestion(numberQuestion, ball, { 1: [8, 9, 18] });
    resultObj.maximalismBall += getBallByQuestion(numberQuestion, ball, { 1: [4, 16] });
    resultObj.perspectiveBall += getBallByQuestion(numberQuestion, ball, {
      1: [2, 3, 12, 24, 26, 27],
    });
    resultObj.antisuicidalBall += getBallByQuestion(numberQuestion, ball, { 1: [19, 21] });
  }

  for (const key in resultObj) {
    const indexObj = {
      affectivityBall: 1.1,
      antisuicidalBall: 3.2,
      barriersBall: 2.3,
      demonstrativenessBall: 1.2,
      insolvencyBall: 1.5,
      maximalismBall: 3.2,
      uniquenessBall: 1.2,
      perspectiveBall: 1.1,
      pessimismBall: 1,
    };

    if (indexObj[key]) {
      const calculatedValue = Number(resultObj[key] * indexObj[key]);

      resultObj.totalSuicideBall += calculatedValue;

      resultObj[key] = calculatedValue.toFixed(2);
    }
  }

  resultObj.totalSuicideBall = Number(resultObj.totalSuicideBall).toFixed(2);

  return resultObj;
};

export const processProfessionalOrientation = (questionsArr) => {
  const resultObj = {
    economicWork: 0,
    peopleWork: 0,
    smartWork: 0,
    practicalWork: 0,
    aestheticWork: 0,
    extremeWork: 0,
  };

  for (const question of questionsArr) {
    const numberQuestion = parseInt(question.numberQuestion);
    const position = parseInt(question.position);

    resultObj.peopleWork += getBallByQuestion(numberQuestion, position, {
      1: [1, 13, 18, 24],
      2: [3, 6, 8, 16],
      3: [5, 11, 15, 20],
    });
    resultObj.smartWork += getBallByQuestion(numberQuestion, position, {
      1: [3, 5, 21],
      2: [7, 9, 11, 14, 22],
      3: [2, 6, 18, 23],
    });
    resultObj.practicalWork += getBallByQuestion(numberQuestion, position, {
      1: [11, 12, 15, 22],
      2: [4, 5, 18, 20],
      3: [7, 16, 19, 21],
    });
    resultObj.aestheticWork += getBallByQuestion(numberQuestion, position, {
      1: [2, 7, 9, 23],
      2: [12, 14, 17, 21],
      3: [1, 3, 10, 22],
    });
    resultObj.extremeWork += getBallByQuestion(numberQuestion, position, {
      1: [8, 10, 17, 19],
      2: [2, 13, 15, 24],
      3: [4, 9, 12, 14],
    });
    resultObj.economicWork += getBallByQuestion(numberQuestion, position, {
      1: [4, 6, 16, 20],
      2: [1, 10, 19, 23],
      3: [8, 13, 17, 24],
    });
  }

  return resultObj;
};
