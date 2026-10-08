function deriveJourneyState({ journey = null, assessment, profile, capabilities = [], activation, documents = [], opportunity }) {
  const assessmentScore = assessment?.total_score ?? profile?.valu_index ?? null
  const hasAssessment = !!(assessment?.completed_at || profile?.assessment_completed_at || profile?.valu_index != null)
  const assessmentCurrent = hasAssessment && (!assessment?.expires_at || new Date(assessment.expires_at).getTime() > Date.now())

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
  if (!profile?.cv_url?.trim()) profileMissing.push('Your CV')

  const profileReady = profile?.profile_complete === true && profileMissing.length === 0
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
  const opportunityAccess = !!journey?.marketplace_ready || listed
  const opportunityEngaged = !!opportunity

  const journeyStage = journey?.journey_stage || (
    !hasAssessment ? 'signed_up' :
    profile ? (profileReady ? 'capability_eligibility' : 'profile_incomplete') :
    'full_valu_completed'
  )

  const stageNext = {
    signed_up: 'assess',
    taster_started: 'assess',
    taster_completed: 'assess',
    full_valu_started: 'assess',
    full_valu_completed: 'profile',
    marketplace_profile_created: 'profile',
    profile_incomplete: 'profile',
    profile_complete: 'capability',
    capability_eligibility: capabilitySelected && !eligibilityComplete ? 'eligibility' : 'capability',
    marketplace_enhanced: 'opportunity',
  }
  const next = stageNext[journeyStage] || 'assess'

  const recoveryReason = journey?.next_action ||
    ({
      assess: 'Continue your VALU journey.',
      profile: 'Complete your professional profile.',
      capability: 'Add your capability.',
      eligibility: 'Complete your capability eligibility.',
      opportunity: 'Explore your Valoria opportunities.',
    }[next] || 'Continue your Valoria journey.')

  return {
    journey: {
      stage: journeyStage,
      progressPercent: Number(journey?.progress_percent ?? 0),
      stageStartedAt: journey?.stage_started_at || null,
      nextAction: journey?.next_action || null,
      lifecycleState: journey?.lifecycle_state || null,
      stateVersion: Number(journey?.state_version ?? 1),
    },
    assessment: {
      complete: hasAssessment,
      current: assessmentCurrent,
      reportStatus,
      reportReady,
      reportDelivered,
      score: assessmentScore,
      designation: assessment?.designation || profile?.designation || null,
    },
    report: {
      complete: reportReady && !!activation?.status && activation.status === 'activated',
      ready: reportReady,
      delivered: reportDelivered,
      status: reportStatus,
      valueActivationReady: !!activation && ['ready', 'activated'].includes(activation.status),
      valueActivationComplete: activation?.status === 'activated',
      activation: activation || null,
    },
    profile: { complete: profileReady, missing: profileMissing },
    capability: { complete: capabilitySelected, capabilities: activeCapabilities, eligible: eligibleCapabilities, missing: capabilityMissing },
    eligibility: { complete: eligibilityComplete, missing: [...new Set([...profileMissing, ...capabilityMissing])], capabilities: eligibleCapabilities },
    marketplace: {
      complete: opportunityAccess,
      profileCreated: !!profile && hasAssessment,
      capabilities: listedCapabilities,
      enhanced: journeyStage === 'marketplace_enhanced',
    },
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
