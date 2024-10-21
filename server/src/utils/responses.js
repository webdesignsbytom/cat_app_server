// Status responses
const STATUS_MESSAGES = {
  200: `success`,
  201: `success`,
  400: `fail`,
  401: `fail`,
  403: `fail`,
  404: `fail`,
  500: `error`,
};

export const EVENT_MESSAGES = {
  badRequest: `Bad Request`,
  notFound: `Not Found`,
  missingUserIdentifier: `Missing User identifier`,
  missingFields: `Missing fields in request`,
  malformedData: `Data incorrectly formatted or malformed request`,
  // Cats
  catTag: `Cat database`,
  catNotFound: `Failed to find cat/s`,
  createCatFail: `Failed to create cat`,
  deleteCatFail: `Failed to delete cat`,
  // Complaints
  complaintTag: `Complaint database`,
  complaintNotFound: `Failed to find complaint/s`,
  userComplaintsNotFound: `Failed to find user complaints`,
  createComplaintFail: `Failed to create complaint`,
  markComplaintViewedFailed: `Failed to mark complaint as viewed`,
  // Contacts
  contactTag: `Contact database.`,
  contactNotFound: `Failed to find contact(s).`,
  createContactFail: `Failed to create contact.`,
  // Events
  eventTag: `Event database.`,
  eventNotFound: `Failed to find event.`,
  createEventFail: `Failed to create event.`,
  // Playlists
  playlistTag: `Playlist database.`,
  playlistNotFound: `Failed to find playlist(s).`,
  playlistIdNotFound: `Playlist ID not found in database.`,
  createPlaylistFail: `Failed to create new playlist.`,
  updatePlaylistError: `Failed to update playlist.`,
  deletePlaylistError: `Failed to delete playlist.`,
  // Users
  userTag: `User database.`,
  userNotFound: `Failed to find user(s).`,
  emailInUse: `Email already in use.`,
  emailNotFound: `Email not found in database.`,
  idNotFound: `User ID not found in database.`,
  createUserFail: `Failed to create new user.`,
  passwordMatchError: `Password match error for reset. New passwords do not match.`,
  resetPasswordRequestSuccessful: `Password reset email has been sent successfully.`,
  passwordResetError: `Account record doesn't exist or has been reset already.`,
  passwordResetEmailError: `Failed to send password reset email.`,
  updateUserError: `Failed to update user.`,
  deleteUserError: `Failed to delete user.`,
  // Verification
  verificationTag: `Verification database.`,
  verificationNotFound: `Failed to find verification.`,
  verificationUpdateFailed: `Failed to update verification.`,
  verificationEmailFailed: `Failed to send verification email.`,
  verificationNotFoundReturn: `Account record doesn't exist or has been verified already. Please sign up or log in.`,
  expiredLinkMessage: `Link has expired. Please sign up or log in and check your account.`,
  invalidVerification: `Invalid verification details passed. Check your inbox, or contact support.`,
  // Videos
  videoTag: `Video database.`,
  videoNotFound: `Failed to find video(s).`,
  videoIdNotFound: `Video ID not found in database.`,
  videoNotInPlaylist: `Video is not in the playlist`,
  createVideoFail: `Failed to create new video.`,
  videoNotApprovedForUse: `Video status is not set to 'APPROVED' and cannot be added to a playlist.`,
  updateVideoError: `Failed to update video.`,
  deleteVideoError: `Failed to delete video.`,
};

// Error responses for eventEmitter/errors
export const RESPONSE_MESSAGES = {
  ConflictEvent: `Request conflicts with data on server.`,
  DeactivatedUserEvent: `The target user account has been deactivated.`,
  ServerErrorEvent: `Internal Server Error.`,
  CreateEventError: `Failed to create an event log.`,
  NotFoundEvent: `Was not found.`,
  NoPermissionEvent: `You are not authorized to perform this action.`,
  NoValidationEvent: `Unable to verify user.`,
  BadRequestEvent: `Incorrect request syntax or malformed request.`,
  MissingFieldEvent: `Missing fields in body.`,
};

// Data responses
export function sendDataResponse(res, statusCode, payload) {
  return res.status(statusCode).json({
    status: STATUS_MESSAGES[statusCode],
    data: payload,
  });
}

// Error responses
export function sendMessageResponse(res, statusCode, message) {
  return res.status(statusCode).json({
    status: STATUS_MESSAGES[statusCode],
    message,
  });
}
