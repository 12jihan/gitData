import axios from 'axios';
import AWS from 'aws-sdk';

// AWS.config.update({
//     region: "us-east-1"
// });

const ddb = new AWS.DynamoDB();
const paramsTableCreate = {
    TableName: "GithubRepos",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH" } // Partition key.
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};








const user = '12jikan';
collectAndPush();

// Gets the data and puts it in my own database:
async function collectAndPush() {
    const items = await getData('12jikan');
    
    items.forEach(item => {
        // Parameters for putting data into dynamodb:
        let params = {
            TableName: "GithubRepos",
            Item: {
                "id": {
                    S: item.id.toString()
                },
                "name": { 
                    S: item.name 
                },
                "user": {
                    S: item.owner.login
                },
                "description": {
                    S: item.description ? item.description : ""
                },
                "size": {
                    S: `${Math.floor(item.size/1000)}mb`
                },
                "language": {
                    S: item.language ? item.language : ""
                },
                "forks_count": {
                    N: item.forks_count.toString()
                },
                "stars": {
                    N: item.stargazers_count.toString()
                },
                "download_link": {
                    S: `https://github.com/12jikan/${item.name}/archive/refs/heads/${item.default_branch}.zip`
                },
                "date_created": {
                    S: item.created_at
                },
                "watchers": {
                    N: item.watchers.toString()
                },
                "date_updated": {
                    N: Date.now().toString()
                }
            },
            ReturnConsumedCapacity: "TOTAL",
        };

        // putItem function:
        ddb.putItem(params, (err, data) => {
            if(err) console.error("error", err.message);
            if(data) console.log("results: ", data);
        });
    })
}



// Gets the data from github:
async function getData(username) {
    let res = await axios.get(`https://api.github.com/users/${username}/repos`);
    let data = await res.data;
    return data;
};

// Create table if it doesn't already exist:
async function createTable() {
    await ddb.createTable(paramsTableCreate, (err, data) => {
        if (err) console.error("error:\n ", [err.message]);
        if (data) console.log("data: ", [data]);
    });
};