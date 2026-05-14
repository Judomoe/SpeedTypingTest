function serializeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    country: user.country || '🌍',
    isPro: Boolean(user.isPro),
    createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
    stats: user.stats,
  }
}

function serializeScore(score) {
  return {
    id: score._id.toString(),
    userId: score.userId.toString(),
    wpm: score.wpm,
    rawWpm: score.rawWpm,
    acc: score.accuracy,
    consistency: score.consistency,
    errors: score.errorCount,
    correct: score.correct,
    incorrect: score.incorrect,
    extra: score.extra,
    missed: score.missed,
    dur: score.duration,
    mode: score.mode,
    language: score.language,
    wpmData: score.wpmData,
    rawData: score.rawData,
    errData: score.errData,
    timestamp: score.createdAt?.toISOString?.() || new Date().toISOString(),
  }
}

module.exports = { serializeUser, serializeScore }
