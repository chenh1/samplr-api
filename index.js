import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.set('port', (process.env.PORT || 8000));

app.get('/', function(request, response) {
  response.send('Initialized')
});

app.get('/visibleEffect', function(req, res) {
  res.json([
    {"id": 0, "counter": 0}
  ]);
});

app.get('/tracks', function(req, res) {
  res.json([
    {"id": 0, "divisions": 4},
    {"id": 1, "divisions": 16},
    {"id": 2, "divisions": 3},
    {"id": 3, "divisions": 8},
    {"id": 4, "divisions": 2}
  ]);
});

app.listen(app.get('port'), function() {
  console.log("Running on localhost:" + app.get('port')); 
});