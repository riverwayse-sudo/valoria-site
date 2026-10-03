function deriveJourneyState({ assessment, profile, capabilities = [], activation, documents = [], opportunity }) {
  const assessmentScore = Number(assessment?.total_score ?? profile?.valu_index ?? 0)
  const hasAssessment = !!(assessment?.completed_at || profile?.assessment_completed_at || profile?.valu_index != null)
  const assessmentCurrent = hasAssessment && assessmentScore >= 35 &&
    (!assessment?.expires_at || new Date(assessment.expires_at).getTime() > Date.now())

  const reportStatus = assessment?.report_status ||
    (assessment?.ai_report ? 'READY' : hasAssessment ? 'PENDING' : 'NOT_STARTED')
  const reportReady = ['READY', 'EMAIL_PENDING', 'SENT'].includes(reportStatus) || !!assessment?.ai_report
  const reportDelivered = reportStatus === 'SENT' || !!assessment?.report_email_sent_at

  const profileMissing = []
  if (!profile?.display_name?.trim()) profileMissing.push('Your name')
  if (!profile?.current_job_title?.trim() && !profile?.headline?.trim()) profileMissing.push('Your professional title')
  if (!profile?.bio?.trim()) profileMissing.push('Your professional bio')
  if (!profile?.industry?.trim()) profileMissing.push('Your industry')
  if (!profile?.username?.trim()) profileMissing.push('Your username')
  if (!profile?.phone?.trim()) profileMissing.push('Your phone number')
  if (!profile?.location?.trim()) profileMissing.push('Your location')
  if (!Array.isArray(profile?.languages) || profile.languages.length === 0) profileMissing.push('At least one language')
  if (!profile?.photo_url?.trim()) profileMissing.push('Your profile photo')
  if (!profile?.cv_url?.trim()) profileMissing.push('Your CV')

  const profileReady = profile?.profile_complete === true && profileMissing.length === 0 && assessmentCurrent
  const activeCapabilities = capabilities.filter(c => c.is_active)
  const eligibleCapabilities = activeCapabilities.filter(c =>
    c.eligible_for_listing || c.eligibility_status === 'eligible' || c.eligibility_status === 'listed'
  )
  const listedCapabilities = activeCapabilities.filter(c =>
    c.eligible_for_listing === true && c.eligibility_status === 'listed'
  )
  const capabilityMissing = [...new Set(activeCapabilities.flatMap(c =>
    Array.isArray(c.missing_requirements) ? c.missing_requirements : []
  ))]
  const capabilitySelected = activeCapabilities.length > 0
  const eligibilityComplete = profileReady && capabilitySelected && eligibleCapabilities.length > 0
  const listed = listedCapabilities.length > 0 && eligibilityComplete
  const opportunityAccess = listed
  const opportunityEngaged = !!opportunity
  const valueActivationReady = !!activation && ['ready', 'activated'].includes(activation.status)
  const valueActivationComplete = activation?.status === 'activated'

  let next = 'assess'
  let recoveryReason = null
  if (!hasAssessment) {
    next = 'assess'
    recoveryReason = 'No completed VALU assessment is linked to this account.'
  } else if (!reportReady) {
    next = 'report'
    recoveryReason = 'Your VALU assessment is complete, but the report is not ready yet.'
  } else if (!valueActivationReady) {
    next = 'report'
    recoveryReason = 'Your VALU report is available; activate the value plan to continue.'
  } else if (!profileReady) {
    next = 'profile'
    recoveryReason = profileMissing.length
      ? `Complete your professional profile: ${profileMissing.join(', ')}.`
      : 'Your professional profile still needs to be completed against the current VALU state.'
  } else if (!capabilitySelected) {
    next = 'capability'
    recoveryReason = 'Choose at least one active capability/path.'
  } else if (!eligibilityComplete) {
    next = 'eligibility'
    recoveryReason = capabilityMissing.length
      ? `Complete the outstanding capability requirements: ${capabilityMissing.join(', ')}.`
      : 'Complete capability eligibility requirements.'
  } else if (!listed) {
    next = 'listed'
    recoveryReason = 'Your capability is eligible but has not completed the marketplace listing transition.'
  } else {
    next = 'opportunity'
    recoveryReason = opportunityEngaged
      ? 'Your opportunity journey is active; continue with the latest engagement.'
      : 'You are listed and can now review matched opportunities.'
  }

  return {
    assessment: {
      complete: hasAssessment,
      current: assessmentCurrent,
      reportStatus,
      reportReady,
      reportDelivered,
      score: assessment?.total_score ?? profile?.valu_index ?? null,
      designation: assessment?.designation || profile?.designation || null,
    },
    report: {
      complete: reportReady && valueActivationComplete,
      ready: reportReady,
      delivered: reportDelivered,
      status: reportStatus,
      valueActivationReady,
      valueActivationComplete,
      activation: activation || null,
    },
    profile: { complete: profileReady, missing: profileMissing },
    capability: { complete: capabilitySelected, capabilities: activeCapabilities, eligible: eligibleCapabilities, missing: capabilityMissing },
    eligibility: { complete: eligibilityComplete, missing: [...new Set([...profileMissing, ...capabilityMissing])], capabilities: eligibleCapabilities },
    marketplace: { complete: listed, capabilities: listedCapabilities },
    opportunity: { complete: opportunityAccess, access: opportunityAccess, engaged: opportunityEngaged, latest: opportunity || null },
    passport: {
      capabilities: activeCapabilities,
      verification: {
        cv: documents.find(d => d.document_type === 'cv')?.verification_status || 'not_submitted',
        verifiedDocuments: documents.filter(d => d.verification_status === 'verified').length,
        totalDocuments: documents.length,
      },
    },
    next,
    recoveryReason,
  }
}

module.exports = { deriveJourneyState }
