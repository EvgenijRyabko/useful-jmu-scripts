const KeysValue = {
  StudyBall: 'studyBall',
  StudyGroupsBall: 'studyGroupsBall',
  TotalSuicideBall: 'totalSuicideBall',
};

export const keysCriticalValue = {
  [KeysValue.StudyBall]: [{ operator: '<', value: 7 }],
  [KeysValue.StudyGroupsBall]: [{ operator: '<', value: 10 }],
  [KeysValue.TotalSuicideBall]: [{ operator: '>', value: 35.64 }],
};
