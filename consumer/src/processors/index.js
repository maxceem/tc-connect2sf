/**
 * This is entry point of the Kafka consumer processors.
 */
'use strict';

const ProjectCreatedHandler = require('./project/ProjectCreatedHandler');
const ProjectUpdatedHandler = require('./project/ProjectUpdatedHandler');
const ProjectMemberHandler = require('./projectMember/ProjectMemberHandler')
const UserCreatedHandler = require('./user/UserCreatedHandler');
const UserUpdatedHandler = require('./user/UserUpdatedHandler');

// Exports
module.exports = {
  handleProjectCreated: ProjectCreatedHandler.handle,
  handleProjectUpdated: ProjectUpdatedHandler.handle,
  handleUserCreated: UserCreatedHandler.handle,
  handleUserUpdated: UserUpdatedHandler.handle,
  handleProjectMemberAdded: ProjectMemberHandler.handleMemberEvent,
  handleProjectMemberRemoved: ProjectMemberHandler.handleMemberEvent,
};
