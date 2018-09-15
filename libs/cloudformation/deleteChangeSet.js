const AWS = require('aws-sdk');
const describeStack = require('./describeStack');

const cloudformation = new AWS.CloudFormation({
  region: 'eu-west-1',
});


module.exports = (stackName, changesetName) => new Promise((resolve, reject) => {
  // Make sure stack exists
  describeStack(stackName)
    .then((stackData) => {
      if (stackData) {
        // Make sure the changeset exists
        const describeParams = {
          StackName: stackName,
          ChangeSetName: changesetName,
        };
        cloudformation.describeChangeSet(describeParams).promise()
          .then((changesetData) => {
            const deleteParams = {
              ChangeSetName: changesetData.ChangeSetId,
            };
            return cloudformation.deleteChangeSet(deleteParams).promise()
              .then(resolve)
              .catch(() => reject(new Error('Failed to delete the changeset.')));
          })
          .catch((err) => {
            // If no such changeset exists, resolve
            if (err.message === `ChangeSet [${changesetName}] does not exist`) {
              return resolve();
            }

            return reject(new Error(err.message));
          });
      } else {
        resolve();
      }
    })
    .catch(err => reject(new Error(err.message)));
});
