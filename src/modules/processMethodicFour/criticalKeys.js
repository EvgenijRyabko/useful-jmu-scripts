const KeysValue = {
  StudyBall: 'studyBall',
  StudyGroupsBall: 'studyGroupsBall',
  TotalSuicideBall: 'totalSuicideBall',
  EconomicWork: 'economicWork',
  PeopleWork: 'peopleWork',
  SmartWork: 'smartWork',
  PracticalWork: 'practicalWork',
  AestheticWork: 'aestheticWork',
  ExtremeWork: 'extremeWork',

  SearchOfThrill: 'searchOfThrill',
  DesireForDifficulties: 'desireForDifficulties',
  IntoleranceOfMonotony: 'intoleranceOfMonotony',
  SearchOfNewExperiences: 'searchOfNewExperiences',
};

export const keysCriticalValue = {
  [KeysValue.StudyBall]: [{ operator: '<', value: 7 }],
  [KeysValue.StudyGroupsBall]: [{ operator: '<', value: 10 }],
  [KeysValue.TotalSuicideBall]: [{ operator: '>', value: 35.64 }],

  // [KeysValue.EconomicWork]: [{ operator: '>', value: 9 }],
  // [KeysValue.PeopleWork]: [{ operator: '>', value: 9 }],
  // [KeysValue.AestheticWork]: [{ operator: '>', value: 9 }],
  // [KeysValue.PracticalWork]: [{ operator: '>', value: 9 }],
  // [KeysValue.ExtremeWork]: [{ operator: '>', value: 9 }],
  // [KeysValue.SmartWork]: [{ operator: '>', value: 9 }],

  [KeysValue.SearchOfThrill]: [{ operator: '>', value: 12 }],
  [KeysValue.DesireForDifficulties]: [{ operator: '>', value: 12 }],
  [KeysValue.IntoleranceOfMonotony]: [{ operator: '>', value: 12 }],
  [KeysValue.SearchOfNewExperiences]: [{ operator: '>', value: 12 }],
};
