const aws = require('aws-sdk');
const fs = require('fs');

const fileToBuffer = (filePath, cb) => {
  const readStream = fs.createReadStream(filePath);
  const chunks = [];

  // Handle any errors while reading
  readStream.on('error', err => {
    // handle error

    // File could not be read
    return cb(err);
  });

  // Listen for data
  readStream.on('data', chunk => {
    chunks.push(chunk);
  });

  // File is done being read
  readStream.on('close', () => {
    // Create a buffer of the image from the stream
    return cb(null, Buffer.concat(chunks));
  });
};

const comprehend = () => {
  const comprehend = new aws.Comprehend({
    credentials: aws.config.credentials,
    region: 'us-east-2'
  });

  comprehend
    .createDocumentClassifier({
      DataAccessRoleArn: 'arn:aws:iam::401806725265:role/comprehend-stl',
      DocumentClassifierName: 'keywordsAndEins',
      InputDataConfig: {
        S3Uri: 's3://stl-hack-input/keywords-and-eins'
      },
      LanguageCode: 'en',
      Tags: [
        {
          Key: 'code',
          Value: 'Code'
        },
        {
          Key: 'desc',
          Value: 'Description'
        }
      ]
    })
    .promise()
    .then(console.log)
    .catch(console.log);
}

const s3 = () => {
  const s3 = new aws.S3();
  fileToBuffer('./keywordsAndEins.csv', (err, buffer) => {
    if (err) {
      console.log(err);
      return;
    }
    s3.upload({
      Bucket: 'stl-hack-input',
      Key: 'keywords-and-eins',
      Body: buffer
    })
      .promise()
      .then(console.log)
      .catch(console.log);
  });
}

aws.config.getCredentials(err => {
  if (err) {
    console.log(err);
  } else {
    
    comprehend();
  }
});


