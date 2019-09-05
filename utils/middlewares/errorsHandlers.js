const Sentry = require('@sentry/node')
const debug = require("debug")("app:error");
const { config } = require('../../config/index')

Sentry.init({ dsn: `https://${config.sentryDns}@sentry.io/${config.sentryId}` })

function logErrors (err, req, res, next) {
  Sentry.captureException(err)
  debug(err.stack)
  next(err)
}

function wrapErrors(err, req, res, next) {
  if (!err.isBoom) {
    next(boom.badImplementation(err));
  }

  next(err);
}

function clientErrorHandler (err, req, res, next) {
  // catch errors for AJAX request
  if (req.xhr) {
    res.status(500).json({ err: err.message })
  } else {
    next(err)
  }
}

function errorHandler (err, req, res, next) {
  // catch erros while streaming
  if (res.headersSent) {
    next(err)
  }

  if (!config.dev) {
    delete err.stack
  }

  res.status(err.status || 500)
  res.render('error', { error: err })
}

module.exports = {
  logErrors,
  wrapErrors,
  clientErrorHandler,
  errorHandler
}
