const fs = require('fs');
const path = require('path');
const {
  mapObjIndexed,
  pipe,
  values,
  merge,
} = require('ramda');

const objectToArrayWithNameProp = pipe(
  mapObjIndexed((item, key) => merge({ name: key }, item)),
  values,
);

module.exports = (config, provider, servicePath) => {
  // TODO verify authenticationType
  if (!config.authenticationType) {
    throw new Error('appSync property `authenticationType` is required.');
  }
  if (!config.serviceRole) {
    throw new Error('appSync property `serviceRole` is required.');
  }
  if (
    config.authenticationType === 'AMAZON_COGNITO_USER_POOLS' &&
    !config.userPoolConfig
  ) {
    throw new Error('appSync property `userPoolConfig` is required when authenticationType `AMAZON_COGNITO_USER_POOLS` is chosen.');
  }
  if (config.logConfig && !config.logConfig.loggingRoleArn) {
    throw new Error('logConfig property `loggingRoleArn` is required when logConfig exists.');
  }
  if (config.logConfig && !config.logConfig.level) {
    throw new Error('logConfig property `level` must be NONE, ERROR, or ALL when logConfig exists.');
  }

  const mappingTemplatesLocation = config.mappingTemplatesLocation || 'mapping-templates';
  const mappingTemplates = config.mappingTemplates || [];

  const schemaPath = path.join(servicePath, config.schema || 'schema.graphql');
  const schemaContent = fs.readFileSync(schemaPath, {
    encoding: 'utf8',
  });

  const dataSources = objectToArrayWithNameProp(config.dataSources);

  return {
    name: config.name || 'api',
    apiId: config.apiId,
    apiKey: config.apiKey,
    region: provider.region,
    authenticationType: config.authenticationType,
    schema: schemaContent,
    userPoolConfig: config.userPoolConfig,
    serviceRoleArn: config.serviceRole,
    // TODO verify dataSources structure
    dataSources,
    mappingTemplatesLocation,
    mappingTemplates,
    logConfig: config.logConfig,
  };
};
