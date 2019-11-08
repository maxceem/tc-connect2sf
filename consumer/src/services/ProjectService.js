/**
 * Service to get data from TopCoder API
 */
/* global M2m */
const request = require('superagent');
const config = require('config');
const _ = require('lodash');

/**
 * Get project details
 *
 * @param  {String} projectId project id
 *
 * @return {Promise}          promise resolved to project details
 */
const getProject = (projectId) => (
  M2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
    .then((token) => (
      request
        .get(`${config.projectApi.url}/projects/${projectId}`)
        .set('accept', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .then((res) => {
          if (!_.get(res, 'body.result.success')) {
            throw new Error(`Failed to get project details of project id: ${projectId}`);
          }
          const project = _.get(res, 'body.result.content');
          return project;
        }).catch((err) => {
          const errorDetails = _.get(err, 'response.body.result.content.message');
          throw new Error(
            `Failed to get project details of project id: ${projectId}.` +
            (errorDetails ? ' Server response: ' + errorDetails : '')
          );
        })
    ))
    .catch((err) => {
      err.message = 'Error generating m2m token: ' + err.message;
      throw err;
    })
);

/**
 * Activates the given project
 *
 * @param  {String} projectId project id
 *
 * @return {Promise}          promise resolved to the updated project
 */
const activateProject = (projectId) => (
  M2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
    .then((token) => (
      request
        .patch(`${config.projectApi.url}/projects/${projectId}/`)
        .set('accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({ param : { status : 'active' } })
        .then((res) => {
          if (!_.get(res, 'body.result.success')) {
            throw new Error(`Failed to activate project with id: ${projectId}`);
          }
          const project = _.get(res, 'body.result.content');
          return project;
        }).catch((err) => {
          console.log(err);
          const errorDetails = _.get(err, 'response.body.result.content.message');
          throw new Error(
            `Failed to update project with id: ${projectId}.` +
            (errorDetails ? ' Server response: ' + errorDetails : '')
          );
        })
    ))
    .catch((err) => {
      err.message = 'Error generating m2m token: ' + err.message;
      throw err;
    })
);

module.exports = {
  getProject,
  activateProject
};