/**
 * Represents the Salesforce service
 */

import config from 'config';
import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import jwt from 'jsonwebtoken';
import superagent from 'superagent';
import superagentPromise from 'superagent-promise';
import {logAndValidate, log} from '../common/decorators';

const loginBaseUrl = process.env.SALESFORCE_CLIENT_AUDIENCE || 'https://login.salesforce.com';
const request = superagentPromise(superagent, Promise);
const privateKey = fs.readFileSync(path.join(__dirname, '../../config/' + (process.env.KEY_FILE_NAME || 'dev-key.pem')), 'utf8');

const createObjectSchema = {
  type: Joi.string().required(),
  params: Joi.object().required(),
  accessToken: Joi.string().required(),
  instanceUrl: Joi.string().required(),
};

const deleteObjectSchema = {
  type: Joi.string().required(),
  id: Joi.string().required(),
  accessToken: Joi.string().required(),
  instanceUrl: Joi.string().required(),
};

const queryObjectSchema = {
  sql: Joi.string().required(),
  accessToken: Joi.string().required(),
  instanceUrl: Joi.string().required(),
};

class SalesforceService {

  /**
   * Authenticate to Salesforce with pre-configured credentials
   * @returns {{accessToken: String, instanceUrl: String}} the result
   */
  @log([], { removeOutput: true })
  authenticate() {
    const jwtToken = jwt.sign({}, privateKey, {
      expiresIn: '1h', // any expiration
      issuer: config.salesforce.clientId,
      audience: config.salesforce.audience,
      subject: config.salesforce.subject,
      algorithm: 'RS256',
    });
    return request
      .post(`${loginBaseUrl}/services/oauth2/token`)
      .type('form')
      .send({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken,
      })
      .end()
      .then((res) => ({
        accessToken: res.body.access_token,
        instanceUrl: res.body.instance_url,
      }));
  }

  /**
   * Create a new object
   * @param {String} type the type name
   * @param {String} params the object properties
   * @param {String} accessToken the access token
   * @param {String} instanceUrl the salesforce instance url
   * @returns {String} the created object id
   */
  @logAndValidate(['type', 'params', 'accessToken', 'instanceUrl'], createObjectSchema)
  createObject(type, params, accessToken, instanceUrl) {
    return request
      .post(`${instanceUrl}/services/data/v37.0/sobjects/${type}`)
      .set({
        authorization: `Bearer ${accessToken}`,
      })
      .send(params)
      .end()
      .then((res) => res.body.id);
  }

  /**
   * Run the query statement
   * @param {String} sql the Saleforce sql statement
   * @param {String} accessToken the access token
   * @param {String} instanceUrl the salesforce instance url
   * @returns {{totalSize: Number, done: Boolean, records: Array}} the result
   */
  @logAndValidate(['sql', 'accessToken', 'instanceUrl'], queryObjectSchema)
  query(sql, accessToken, instanceUrl) {
    return request
      .get(`${instanceUrl}/services/data/v37.0/query`)
      .set({
        authorization: `Bearer ${accessToken}`,
      })
      .query({ q: sql })
      .end()
      .then((res) => res.body);
  }

  /**
   * Delete an object by id
   * @param {String} type the type name
   * @param {String} id the object id to delete
   * @param {String} accessToken the access token
   * @param {String} instanceUrl the salesforce instance url
   */
  @logAndValidate(['type', 'id', 'accessToken', 'instanceUrl'], deleteObjectSchema)
  deleteObject(type, id, accessToken, instanceUrl) {
    return request
      .del(`${instanceUrl}/services/data/v37.0/sobjects/${type}/${id}`)
      .set({
        authorization: `Bearer ${accessToken}`,
      })
      .end();
  }
}

export default new SalesforceService();
