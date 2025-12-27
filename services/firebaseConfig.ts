
// Firebase has been removed to allow for a purely local/guest mode experience.
// These exports prevent import errors in legacy code but perform no actions.

const auth = null;
const app = null;
const analytics = null;

export { auth, app, analytics };
