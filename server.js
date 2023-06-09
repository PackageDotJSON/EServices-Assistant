const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const http = require('http');
const path = require('path');

var app = express();

app.use(compression());

app.disable('x-powered-by');

// app.use(express.static(__dirname + '/dist/eServices'));

// app.get('/*', (req, res) => res.sendFile(path.join(__dirname)));

app.use(cors());
app.use(bodyParser.json());
app.use(routes);

const port = process.env.PORT;

const address = process.env.address;

const server = http.createServer(app);

server.listen(port, address, () => console.log(`Running on port ${port}`));

// app.listen(port, address, function()
// {
//   console.log(`Running on port ${port}`);
// });
